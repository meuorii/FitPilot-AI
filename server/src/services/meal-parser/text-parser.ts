import {
  getFoodById,
  matchTarget,
  type ComboEntry,
  type FoodEntry,
} from './food-db.js';
import { extractQuantity, MASS_FACTORS, type QuantityInfo } from './quantity.js';
import type { ParsedFood } from './types.js';
import { round1, round2 } from './utils.js';

const LABEL_PREFIX =
  /^(?:breakfast|lunch|dinner|snack|snacks|merienda|almusal|tanghalian|hapunan)\s*[:\-]\s*/i;

const FILLER_PREFIX =
  /^(?:(?:i\s+)?(?:ate|had|kumain\s+ako\s+ng|kumain\s+ng|kain\s+ng)|for\s+(?:breakfast|lunch|dinner|snack|merienda))\b[:\s-]*/i;

const SEPARATOR_WORDS = /^\s+(?:and|at|with|saka|tsaka|plus)\s+/i;

/** Split "a, b and c" into segments, but never inside parentheses or inside "1,200". */
const splitSegments = (text: string): string[] => {
  const segments: string[] = [];
  let current = '';
  let depth = 0;

  const flush = (): void => {
    if (current.trim()) segments.push(current.trim());
    current = '';
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i] ?? '';

    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);

    if (depth === 0) {
      const insideNumber =
        ch === ',' && /\d/.test(text[i - 1] ?? '') && /\d/.test(text[i + 1] ?? '');

      if (!insideNumber && /[,;\n+&]/.test(ch)) {
        flush();
        continue;
      }

      const wordSeparator = text.slice(i).match(SEPARATOR_WORDS);
      if (wordSeparator) {
        flush();
        i += wordSeparator[0].length - 1;
        continue;
      }
    }

    current += ch;
  }

  flush();
  return segments;
};

const cleanSegment = (segment: string): string =>
  segment
    .replace(/^[\s\-•*·]+/, '')
    .replace(LABEL_PREFIX, '')
    .replace(FILLER_PREFIX, '')
    .trim();

const macrosForGrams = (entry: FoodEntry, grams: number) => {
  const factor = grams / 100;

  return {
    calories: Math.round(entry.per100g.calories * factor),
    protein: round1(entry.per100g.protein * factor),
    carbs: round1(entry.per100g.carbs * factor),
    fat: round1(entry.per100g.fat * factor),
  };
};

interface ResolvedAmount {
  grams: number;
  quantity: number;
  unit: string;
  /** true when the unit the user typed is unknown for this food */
  assumed: boolean;
}

const resolveAmount = (
  entry: FoodEntry,
  count: number | null,
  unit: string | null,
  weightG: number | null,
): ResolvedAmount => {
  const quantity = count ?? 1;

  if (weightG !== null) {
    return {
      grams: weightG,
      quantity,
      unit: unit ?? 'serving',
      assumed: false,
    };
  }

  if (unit === null || unit === 'serving') {
    return {
      grams: quantity * entry.servingGrams,
      quantity,
      unit: unit ?? entry.servingUnit,
      assumed: false,
    };
  }

  const massFactor = MASS_FACTORS[unit];
  if (massFactor !== undefined) {
    return { grams: quantity * massFactor, quantity, unit, assumed: false };
  }

  const perUnit = entry.units[unit];
  if (perUnit !== undefined) {
    return { grams: quantity * perUnit, quantity, unit, assumed: false };
  }

  return {
    grams: quantity * entry.servingGrams,
    quantity,
    unit: entry.servingUnit,
    assumed: true,
  };
};

const buildDbFood = (
  entry: FoodEntry,
  amount: ResolvedAmount,
  rawText: string,
  score: number,
  notes: string | null,
): ParsedFood => ({
  name: entry.name,
  quantity: round2(amount.quantity),
  unit: amount.unit,
  weight_g: round1(amount.grams),
  ...macrosForGrams(entry, amount.grams),
  source: 'db',
  confidence: round2(Math.min(0.9, score) * (amount.assumed ? 0.85 : 1)),
  notes,
  raw_text: rawText,
});

/** Placeholder the user fills in manually when we could not recognise the food. */
const buildManualFood = (
  name: string,
  info: QuantityInfo,
  rawText: string,
): ParsedFood => ({
  name: name || rawText,
  quantity: info.count ?? 1,
  unit: info.unit ?? 'serving',
  weight_g: info.weightG === null ? null : round1(info.weightG),
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  source: 'manual',
  confidence: 0,
  notes: 'Not found in the food database. Please enter the macros.',
  raw_text: rawText,
});

const expandCombo = (
  combo: ComboEntry,
  multiplier: number,
  rawText: string,
  score: number,
): ParsedFood[] => {
  const result: ParsedFood[] = [];

  for (const part of combo.parts) {
    const entry = getFoodById(part.foodId);
    if (!entry) continue;

    const amount = resolveAmount(entry, part.quantity * multiplier, part.unit, null);
    // Combos are standard-plate estimates, so cap their confidence.
    result.push(
      buildDbFood(entry, amount, rawText, Math.min(score, 0.78), `Part of ${combo.name}`),
    );
  }

  return result;
};

export interface FreeTextResult {
  foods: ParsedFood[];
  unmatched: string[];
  warnings: string[];
}

/**
 * Free-text parser: "2 cups sinangag, tuna omelette and 1 hopia".
 * Looks every item up in the local food database. Items that cannot be found
 * come back as zero-macro "manual" placeholders so the user can fill them in.
 */
export const parseFreeText = (text: string): FreeTextResult => {
  const foods: ParsedFood[] = [];
  const unmatched: string[] = [];
  const warnings: string[] = [];

  // "3-in-1" / "3 in 1" would otherwise be read as the count "3".
  const prepared = text.replace(/\b3\s*-?\s*in\s*-?\s*1\b/gi, 'threeinone');

  for (const rawSegment of splitSegments(prepared)) {
    const segment = cleanSegment(rawSegment);
    if (!/[a-z]/i.test(segment)) continue;

    const info = extractQuantity(segment);
    const match = info.rest ? matchTarget(info.rest) : null;

    if (!match) {
      unmatched.push(segment);
      foods.push(buildManualFood(info.rest, info, segment));
      continue;
    }

    if (match.target.kind === 'combo') {
      foods.push(...expandCombo(match.target.combo, info.count ?? 1, segment, match.score));
      continue;
    }

    const entry = match.target.food;
    const amount = resolveAmount(entry, info.count, info.unit, info.weightG);

    if (amount.assumed && info.unit) {
      warnings.push(
        `Unit "${info.unit}" is not known for ${entry.name}; assumed ${amount.quantity} ${amount.unit} (${Math.round(entry.servingGrams)} g each).`,
      );
    }

    foods.push(buildDbFood(entry, amount, segment, match.score, null));
  }

  return { foods, unmatched, warnings };
};
