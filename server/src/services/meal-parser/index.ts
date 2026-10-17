import { parseTable } from './table-parser.js';
import { parseFreeText } from './text-parser.js';
import type {
  ParseContext,
  ParsedFood,
  ParseResult,
  ParserKind,
} from './types.js';
import { round1, round2 } from './utils.js';

export type {
  MacroValues,
  ParseContext,
  ParsedFood,
  ParseResult,
  ParserKind,
  FoodSource,
} from './types.js';

/**
 * Optional last-resort resolver for items the local database could not match.
 * Not set by default: the parser works fully offline without any AI.
 * Each returned food should carry `source: 'ai'` and `raw_text` equal to the
 * unmatched segment it resolves.
 */
export type LlmFallback = (
  unmatched: string[],
  ctx: ParseContext,
) => Promise<ParsedFood[]>;

let llmFallback: LlmFallback | null = null;

const sumOf = (foods: ParsedFood[], key: 'calories' | 'protein' | 'carbs' | 'fat'): number =>
  foods.reduce((total, food) => total + food[key], 0);

const totalsOf = (foods: ParsedFood[]) => ({
  total_calories: Math.round(sumOf(foods, 'calories')),
  total_protein: round1(sumOf(foods, 'protein')),
  total_carbs: round1(sumOf(foods, 'carbs')),
  total_fat: round1(sumOf(foods, 'fat')),
});

const average = (values: number[]): number =>
  values.length === 0 ? 0 : values.reduce((total, value) => total + value, 0) / values.length;

const detectParser = (foods: ParsedFood[]): ParserKind => {
  const hasDb = foods.some((food) => food.source === 'db');
  const hasAi = foods.some((food) => food.source === 'ai');

  if (hasDb && hasAi) return 'mixed';
  if (hasAi) return 'ai';
  if (hasDb) return 'db';
  return 'none';
};

const parse = async (text: string, ctx: ParseContext): Promise<ParseResult> => {
  const input = text.replace(/\r\n?/g, '\n').trim();

  // Layer 1: pasted table with its own macros (no lookup needed).
  const table = parseTable(input);

  if (table) {
    return {
      foods: table.foods,
      ...totalsOf(table.foods),
      confidence: table.confidence,
      needs_manual_edit: false,
      parser: 'table',
      warnings: table.warnings,
      unmatched: [],
    };
  }

  // Layer 2: free text matched against the local Filipino food database.
  const free = parseFreeText(input);
  let foods = free.foods;
  let unmatched = free.unmatched;
  const warnings = [...free.warnings];

  // Layer 3 (optional): external resolver for whatever is still unmatched.
  if (unmatched.length > 0 && llmFallback) {
    try {
      const aiFoods = await llmFallback(unmatched, ctx);
      const resolved = new Set(aiFoods.map((food) => food.raw_text ?? ''));

      unmatched = unmatched.filter((segment) => !resolved.has(segment));
      foods = [
        ...foods.filter(
          (food) => food.source !== 'manual' || !resolved.has(food.raw_text ?? ''),
        ),
        ...aiFoods,
      ];
    } catch (err) {
      console.error('Meal parser LLM fallback failed:', err);
      warnings.push('The AI fallback is unavailable, so unknown items need manual entry.');
    }
  }

  if (foods.length === 0) {
    warnings.push('No food items could be recognised in the text.');
  }

  return {
    foods,
    ...totalsOf(foods),
    confidence: round2(average(foods.map((food) => food.confidence))),
    needs_manual_edit:
      foods.length === 0 || unmatched.length > 0 || foods.some((food) => food.source === 'manual'),
    parser: detectParser(foods),
    warnings,
    unmatched,
  };
};

export const mealParser = {
  parse,
  setLlmFallback(fallback: LlmFallback | null): void {
    llmFallback = fallback;
  },
};
