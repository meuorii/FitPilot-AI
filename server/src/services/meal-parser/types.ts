export interface MacroValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** Where the numbers for a food item came from. */
export type FoodSource = 'table' | 'db' | 'ai' | 'manual';

/** Which parsing layer produced the overall result. */
export type ParserKind = 'table' | 'db' | 'ai' | 'mixed' | 'none';

export interface ParsedFood extends MacroValues {
  name: string;
  quantity: number;
  unit: string;
  weight_g: number | null;
  source: FoodSource;
  /** 0..1 */
  confidence: number;
  notes: string | null;
  raw_text: string | null;
}

export interface ParseContext {
  userId: string;
  mealType?: string | undefined;
}

export interface ParseResult {
  foods: ParsedFood[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  /** 0..1 */
  confidence: number;
  needs_manual_edit: boolean;
  parser: ParserKind;
  warnings: string[];
  /** Segments of the input that could not be matched to any food. */
  unmatched: string[];
}
