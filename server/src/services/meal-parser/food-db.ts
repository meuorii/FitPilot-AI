import type { MacroValues } from './types.js';
import { normalizeText, similarity } from './utils.js';

/**
 * Starter food database. Values are per 100 g of the food as normally eaten
 * (cooked, where relevant) and are APPROXIMATE. Verify against the FNRI
 * Philippine Food Composition Table / product labels and extend freely.
 */

export interface FoodEntry {
  id: string;
  name: string;
  aliases: string[];
  per100g: MacroValues;
  /** grams in one "natural" serving (what "1 hopia" or "1 rice" means) */
  servingGrams: number;
  /** label used for that natural serving: pc, cup, serving ... */
  servingUnit: string;
  /** grams per 1 of a given unit, e.g. { cup: 158, pc: 45 } */
  units: Record<string, number>;
}

export interface ComboPart {
  foodId: string;
  quantity: number;
  unit: string;
}

export interface ComboEntry {
  id: string;
  name: string;
  aliases: string[];
  parts: ComboPart[];
}

type Per100 = [calories: number, protein: number, carbs: number, fat: number];

const food = (
  id: string,
  name: string,
  aliases: string[],
  per100: Per100,
  servingGrams: number,
  servingUnit = 'serving',
  units: Record<string, number> = {},
): FoodEntry => ({
  id,
  name,
  aliases,
  per100g: {
    calories: per100[0],
    protein: per100[1],
    carbs: per100[2],
    fat: per100[3],
  },
  servingGrams,
  servingUnit,
  units,
});

const FOODS: FoodEntry[] = [
  // Rice & staples
  food('white-rice', 'White Rice (cooked)', ['white rice', 'rice', 'steamed rice', 'plain rice', 'cooked rice', 'kanin'], [130, 2.7, 28.2, 0.3], 158, 'cup', { cup: 158 }),
  food('sinangag', 'Garlic Rice (Sinangag)', ['sinangag', 'garlic rice', 'garlic fried rice', 'fried rice', 'sinangag na kanin'], [153, 3.0, 27.7, 3.1], 160, 'cup', { cup: 160 }),
  food('pandesal', 'Pandesal', ['pandesal', 'pan de sal'], [300, 9, 54, 4], 40, 'pc', { pc: 40 }),
  food('bread', 'White Bread', ['bread', 'white bread', 'sliced bread', 'loaf bread', 'tinapay'], [265, 9, 49, 3.2], 28, 'slice', { slice: 28, pc: 28 }),
  food('oatmeal', 'Oatmeal (cooked)', ['oatmeal', 'cooked oatmeal'], [71, 2.5, 12, 1.5], 234, 'cup', { cup: 234, bowl: 300 }),
  food('rolled-oats', 'Rolled Oats (dry)', ['oats', 'rolled oats', 'dry oats'], [379, 13.2, 67.7, 6.5], 40, 'serving', { cup: 80 }),
  food('kamote', 'Sweet Potato (Kamote)', ['kamote', 'camote', 'sweet potato'], [86, 1.6, 20.1, 0.1], 130, 'pc', { pc: 130 }),

  // Eggs
  food('egg-whole', 'Egg (whole, boiled)', ['egg', 'eggs', 'whole egg', 'boiled egg', 'hard boiled egg', 'nilagang itlog', 'itlog'], [155, 12.6, 1.1, 10.6], 50, 'pc', { pc: 50 }),
  food('fried-egg', 'Fried Egg', ['fried egg', 'sunny side up', 'sunny side up egg', 'pritong itlog', 'scrambled egg', 'scrambled eggs'], [196, 13.6, 0.8, 14.8], 46, 'pc', { pc: 46 }),
  food('egg-white', 'Egg White', ['egg white', 'egg whites', 'puti ng itlog'], [52, 10.9, 0.7, 0.2], 33, 'pc', { pc: 33 }),
  food('tuna-omelette', 'Tuna Omelette', ['tuna omelette', 'tuna omelet'], [126, 14.8, 2.2, 6.4], 86, 'serving', { pc: 86 }),

  // Ulam
  food('chicken-adobo', 'Chicken Adobo', ['chicken adobo', 'adobong manok', 'adobo manok', 'adobo'], [190, 18, 2, 12], 150),
  food('pork-adobo', 'Pork Adobo', ['pork adobo', 'adobong baboy', 'adobo baboy'], [250, 16, 3, 19], 120),
  food('pork-menudo', 'Pork Menudo', ['pork menudo', 'menudo', 'menudo baboy'], [150, 12, 7, 8], 190),
  food('chicken-breast', 'Chicken Breast (cooked)', ['chicken breast', 'grilled chicken breast', 'grilled chicken', 'boiled chicken breast', 'baked chicken breast', 'dibdib ng manok'], [165, 31, 0, 3.6], 100, 'serving', { pc: 170 }),
  food('fried-chicken', 'Fried Chicken', ['fried chicken', 'pritong manok', 'fried chicken leg', 'fried chicken thigh'], [250, 19, 9, 15], 120, 'pc', { pc: 120 }),
  food('sinigang', 'Sinigang na Baboy', ['sinigang', 'sinigang na baboy', 'pork sinigang'], [75, 6, 3, 4.5], 300, 'serving', { bowl: 300, cup: 240 }),
  food('tinola', 'Tinolang Manok', ['tinola', 'tinolang manok', 'chicken tinola'], [60, 7, 2, 2.5], 300, 'serving', { bowl: 300, cup: 240 }),
  food('nilaga', 'Nilagang Baboy', ['nilaga', 'nilagang baboy', 'pork nilaga'], [70, 6, 4, 3.5], 300, 'serving', { bowl: 300, cup: 240 }),
  food('bangus', 'Fried Bangus (Milkfish)', ['bangus', 'fried bangus', 'daing na bangus', 'pritong bangus', 'milkfish', 'boneless bangus'], [200, 22, 0, 12], 120, 'serving', { pc: 120 }),
  food('tilapia', 'Fried Tilapia', ['tilapia', 'fried tilapia', 'pritong tilapia'], [170, 24, 2, 8], 150, 'serving', { pc: 150 }),
  food('longganisa', 'Longganisa', ['longganisa', 'longanisa', 'skinless longganisa'], [310, 13, 12, 23], 40, 'pc', { pc: 40 }),
  food('tocino', 'Pork Tocino', ['tocino', 'pork tocino'], [240, 16, 18, 12], 80),
  food('beef-tapa', 'Beef Tapa', ['tapa', 'beef tapa', 'tapang baka'], [190, 22, 6, 8], 100),
  food('hotdog', 'Hotdog', ['hotdog', 'hot dog'], [270, 11, 7, 22], 50, 'pc', { pc: 50 }),
  food('lumpia', 'Lumpiang Shanghai', ['lumpia', 'lumpiang shanghai', 'lumpia shanghai', 'shanghai'], [260, 10, 22, 14], 15, 'pc', { pc: 15 }),
  food('canned-tuna', 'Canned Tuna (in water)', ['tuna', 'canned tuna', 'tuna flakes'], [116, 26, 0, 1], 100, 'can', { can: 100 }),
  food('pancit-canton', 'Instant Pancit Canton', ['pancit canton', 'instant pancit canton', 'lucky me pancit canton', 'instant noodles', 'instant noodle'], [450, 10, 63, 18], 60, 'pack', { pack: 60 }),

  // Snacks & merienda
  food('hopia', 'Hopia (Munggo or Baboy)', ['hopia', 'hopia munggo', 'hopia baboy', 'munggo hopia', 'baboy hopia'], [356, 6.7, 48.9, 13.3], 45, 'pc', { pc: 45 }),
  food('boy-bawang', 'Boy Bawang Cornick', ['boy bawang', 'boy bawang cornick', 'cornick', 'cornick boy bawang'], [500, 10, 63.2, 23.2], 22, 'pack', { pack: 22 }),
  food('banana', 'Banana', ['banana', 'saging', 'lakatan', 'lakatan banana'], [89, 1.1, 22.8, 0.3], 100, 'pc', { pc: 100 }),
  food('apple', 'Apple', ['apple', 'mansanas'], [52, 0.3, 13.8, 0.2], 180, 'pc', { pc: 180 }),
  food('peanut-butter', 'Peanut Butter', ['peanut butter', 'pb'], [588, 25, 20, 50], 16, 'tbsp', { tbsp: 16 }),
  food('whey', 'Whey Protein Powder', ['whey', 'whey protein', 'protein powder'], [400, 80, 8, 6], 30, 'scoop', { scoop: 30 }),

  // Drinks
  food('milk', 'Milk (whole)', ['milk', 'whole milk', 'fresh milk', 'gatas'], [61, 3.2, 4.8, 3.3], 244, 'cup', { cup: 244, glass: 244 }),
  food('coffee-3in1', 'Coffee 3-in-1 (sachet)', ['threeinone', 'threeinone coffee', 'nescafe', 'instant coffee', 'coffee mix', 'kape'], [400, 3, 70, 10], 20, 'sachet', { sachet: 20, pack: 20, pc: 20 }),
  food('black-coffee', 'Black Coffee', ['black coffee', 'brewed coffee', 'americano'], [1, 0.1, 0, 0], 240, 'cup', { cup: 240 }),
  food('softdrink', 'Soft Drink (Cola)', ['coke', 'cola', 'soda', 'softdrink', 'soft drink', 'pepsi', 'sprite', '7up'], [42, 0, 10.6, 0], 330, 'can', { can: 330, glass: 240 }),
  food('water', 'Water', ['water', 'tubig', 'ice water'], [0, 0, 0, 0], 240, 'glass', { glass: 240, cup: 240 }),
];

/** Filipino "silog" plates expand to their components. */
const COMBOS: ComboEntry[] = [
  {
    id: 'tapsilog',
    name: 'Tapsilog',
    aliases: ['tapsilog'],
    parts: [
      { foodId: 'beef-tapa', quantity: 100, unit: 'g' },
      { foodId: 'sinangag', quantity: 1, unit: 'cup' },
      { foodId: 'fried-egg', quantity: 1, unit: 'pc' },
    ],
  },
  {
    id: 'longsilog',
    name: 'Longsilog',
    aliases: ['longsilog'],
    parts: [
      { foodId: 'longganisa', quantity: 2, unit: 'pc' },
      { foodId: 'sinangag', quantity: 1, unit: 'cup' },
      { foodId: 'fried-egg', quantity: 1, unit: 'pc' },
    ],
  },
  {
    id: 'tosilog',
    name: 'Tosilog',
    aliases: ['tosilog', 'tocilog'],
    parts: [
      { foodId: 'tocino', quantity: 80, unit: 'g' },
      { foodId: 'sinangag', quantity: 1, unit: 'cup' },
      { foodId: 'fried-egg', quantity: 1, unit: 'pc' },
    ],
  },
  {
    id: 'hotsilog',
    name: 'Hotsilog',
    aliases: ['hotsilog'],
    parts: [
      { foodId: 'hotdog', quantity: 2, unit: 'pc' },
      { foodId: 'sinangag', quantity: 1, unit: 'cup' },
      { foodId: 'fried-egg', quantity: 1, unit: 'pc' },
    ],
  },
  {
    id: 'bangsilog',
    name: 'Bangsilog',
    aliases: ['bangsilog'],
    parts: [
      { foodId: 'bangus', quantity: 120, unit: 'g' },
      { foodId: 'sinangag', quantity: 1, unit: 'cup' },
      { foodId: 'fried-egg', quantity: 1, unit: 'pc' },
    ],
  },
];

const FOOD_BY_ID = new Map(FOODS.map((entry) => [entry.id, entry] as const));

export const getFoodById = (id: string): FoodEntry | undefined =>
  FOOD_BY_ID.get(id);

export type MatchTarget =
  | { kind: 'food'; food: FoodEntry }
  | { kind: 'combo'; combo: ComboEntry };

export interface FoodMatch {
  target: MatchTarget;
  /** 0..1 */
  score: number;
}

interface AliasEntry {
  alias: string;
  target: MatchTarget;
}

const buildIndex = (): AliasEntry[] => {
  const seen = new Set<string>();
  const entries: AliasEntry[] = [];

  const add = (names: string[], target: MatchTarget): void => {
    for (const name of names) {
      const alias = normalizeText(name);
      if (!alias || seen.has(alias)) continue;
      seen.add(alias);
      entries.push({ alias, target });
    }
  };

  for (const entry of FOODS) {
    add([entry.name, ...entry.aliases], { kind: 'food', food: entry });
  }
  for (const combo of COMBOS) {
    add([combo.name, ...combo.aliases], { kind: 'combo', combo });
  }

  // Longest alias first so "garlic fried rice" wins over "fried rice" and "rice".
  return entries.sort((a, b) => b.alias.length - a.alias.length);
};

const ALIAS_INDEX = buildIndex();
const ALIAS_MAP = new Map(ALIAS_INDEX.map((entry) => [entry.alias, entry.target] as const));

const singularize = (normalized: string): string =>
  normalized
    .split(' ')
    .map((token) =>
      token.length > 3 && token.endsWith('s') && !token.endsWith('ss')
        ? token.slice(0, -1)
        : token,
    )
    .join(' ');

/**
 * exact alias  -> whole-word alias inside the text (longest wins) -> fuzzy (typos)
 */
export const matchTarget = (rawName: string): FoodMatch | null => {
  const normalized = normalizeText(rawName);
  if (!normalized) return null;

  const candidates = Array.from(new Set([normalized, singularize(normalized)]));

  for (const candidate of candidates) {
    const exact = ALIAS_MAP.get(candidate);
    if (exact) return { target: exact, score: 1 };
  }

  for (const candidate of candidates) {
    const padded = ` ${candidate} `;

    for (const entry of ALIAS_INDEX) {
      if (entry.alias.length < 3) continue;

      if (padded.includes(` ${entry.alias} `)) {
        const coverage = entry.alias.length / candidate.length;
        return { target: entry.target, score: 0.6 + 0.3 * Math.min(1, coverage) };
      }
    }
  }

  let best: AliasEntry | null = null;
  let bestScore = 0;

  for (const candidate of candidates) {
    if (candidate.length < 4) continue;

    for (const entry of ALIAS_INDEX) {
      if (entry.alias.length < 4) continue;

      const score = similarity(candidate, entry.alias);
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    }
  }

  if (best && bestScore >= 0.82) {
    return { target: best.target, score: bestScore * 0.85 };
  }

  return null;
};
