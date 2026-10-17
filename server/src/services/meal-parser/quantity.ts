import { parseNumber } from './utils.js';

export const UNIT_ALIASES: Record<string, string> = {
  g: 'g',
  gr: 'g',
  gm: 'g',
  gram: 'g',
  grams: 'g',
  kg: 'kg',
  kilo: 'kg',
  kilos: 'kg',
  oz: 'oz',
  ounce: 'oz',
  ounces: 'oz',
  ml: 'ml',
  pc: 'pc',
  pcs: 'pc',
  piece: 'pc',
  pieces: 'pc',
  piraso: 'pc',
  cup: 'cup',
  cups: 'cup',
  tasa: 'cup',
  tbsp: 'tbsp',
  tablespoon: 'tbsp',
  tablespoons: 'tbsp',
  tsp: 'tsp',
  teaspoon: 'tsp',
  teaspoons: 'tsp',
  serving: 'serving',
  servings: 'serving',
  order: 'serving',
  orders: 'serving',
  plato: 'serving',
  scoop: 'scoop',
  scoops: 'scoop',
  slice: 'slice',
  slices: 'slice',
  bowl: 'bowl',
  bowls: 'bowl',
  mangkok: 'bowl',
  pack: 'pack',
  packs: 'pack',
  sachet: 'sachet',
  sachets: 'sachet',
  can: 'can',
  cans: 'can',
  glass: 'glass',
  glasses: 'glass',
  baso: 'glass',
};

/** Units that are masses/volumes and convert directly to grams. */
export const MASS_FACTORS: Record<string, number> = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  ml: 1,
};

const NUMBER_WORDS: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  half: 0.5,
  isa: 1,
  dalawa: 2,
  tatlo: 3,
  apat: 4,
  lima: 5,
  anim: 6,
};

const WEIGHT_RE = /(\d+(?:[.,]\d+)?)\s*(kg|kilos?|grams?|gm|gr|g|oz|ml)\b/i;

const COUNT_RE =
  /^\s*(?:(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?)|(a|an|one|two|three|four|five|six|half|isa|dalawa|tatlo|apat|lima|anim)\b)\s*/i;

export interface QuantityInfo {
  /** "2" in "2 cups" or "1" in "1 pc" */
  count: number | null;
  /** normalized, non-mass unit such as cup / pc / serving */
  unit: string | null;
  /** explicit weight in grams, e.g. "240g" or "~45g" */
  weightG: number | null;
  /** what is left of the text once quantity parts are removed */
  rest: string;
}

const parseCount = (raw: string): number | null => {
  const token = raw.trim().toLowerCase();

  const word = NUMBER_WORDS[token];
  if (word !== undefined) return word;

  const mixed = token.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    const whole = Number(mixed[1]);
    const numerator = Number(mixed[2]);
    const denominator = Number(mixed[3]);
    return denominator ? whole + numerator / denominator : null;
  }

  const fraction = token.match(/^(\d+)\/(\d+)$/);
  if (fraction) {
    const numerator = Number(fraction[1]);
    const denominator = Number(fraction[2]);
    return denominator ? numerator / denominator : null;
  }

  return parseNumber(token);
};

export const extractQuantity = (input: string): QuantityInfo => {
  let text = input;
  let weightG: number | null = null;
  let count: number | null = null;
  let unit: string | null = null;

  // 1. Explicit weight anywhere: "240g", "~45g", "150 grams"
  const weightMatch = text.match(WEIGHT_RE);
  if (weightMatch) {
    const value = parseNumber(weightMatch[1]);
    const massUnit = UNIT_ALIASES[(weightMatch[2] ?? '').toLowerCase()];
    const factor = massUnit ? MASS_FACTORS[massUnit] : undefined;

    if (value !== null && factor !== undefined) {
      weightG = value * factor;
      text = text.replace(weightMatch[0], ' ');
    }
  }

  // 2. Leading count (+ optional unit): "2 cups", "1 pc", "half", "1/2 cup"
  const countMatch = text.match(COUNT_RE);
  if (countMatch) {
    const consumed = countMatch[0];
    const afterCount = text.slice(consumed.length);
    const numeric = countMatch[1] !== undefined;
    const glued = numeric && !/\s$/.test(consumed) && /^[a-z]/i.test(afterCount);

    const unitMatch = afterCount.match(/^([a-zA-Z]+)\b\.?/);
    const unitName = unitMatch
      ? UNIT_ALIASES[(unitMatch[1] ?? '').toLowerCase()]
      : undefined;
    const isCountableUnit =
      unitName !== undefined && MASS_FACTORS[unitName] === undefined;

    // "7up" / "3in1": digits glued to a word that is not a unit are part of the name.
    if (!glued || isCountableUnit) {
      count = parseCount(countMatch[1] ?? countMatch[2] ?? '');
      text = afterCount;

      if (unitMatch && isCountableUnit && unitName !== undefined) {
        unit = unitName;
        text = afterCount.slice(unitMatch[0].length);
      }
    }
  }

  // 2b. Trailing count + unit: "sinangag 1 cup", "hopia (2 pcs)"
  if (count === null) {
    const trailing = text.match(/[\s(]+(\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)\)?\s*$/);
    const trailingUnit = trailing
      ? UNIT_ALIASES[(trailing[2] ?? '').toLowerCase()]
      : undefined;

    if (
      trailing &&
      trailingUnit !== undefined &&
      MASS_FACTORS[trailingUnit] === undefined
    ) {
      count = parseCount(trailing[1] ?? '');
      unit = trailingUnit;
      text = text.slice(0, trailing.index ?? text.length);
    }
  }

  // 3. Trailing multiplier: "hopia x2"
  if (count === null) {
    const multiplier = text.match(/\s[x×]\s*(\d+(?:\.\d+)?)\s*$/i);
    if (multiplier) {
      count = Number(multiplier[1]);
      text = text.slice(0, multiplier.index ?? text.length);
    }
  }

  const rest = text
    .replace(/[()~]/g, ' ')
    .replace(/^\s*(?:of|ng)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  return { count, unit, weightG, rest };
};
