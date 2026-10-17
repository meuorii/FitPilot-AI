export type MealId = string;

export type MealType =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | string;

export interface MealApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data: T;
}

export interface MealMessageResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * The AI service response is returned by the backend without reshaping it.
 * These common nutrition fields are typed, while extra AI fields are allowed.
 */
export interface MealFoodItem {
  name?: string;
  food_name?: string;
  quantity?: number | string;
  amount?: number | string;
  serving?: number | string;
  serving_size?: number | string;
  unit?: string;
  image_url?: string | null;
  imageUrl?: string | null;
  image?: string | null;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  confidence?: number;
  [key: string]: unknown;
}

export interface ParsedMealData {
  foods?: MealFoodItem[];
  food_items?: MealFoodItem[];

  totalCalories?: number;
  total_calories?: number;

  protein?: number;
  total_protein?: number;

  carbs?: number;
  total_carbs?: number;

  fat?: number;
  total_fat?: number;

  meal_type?: MealType;
  raw_text?: string;
  raw_input_prompt?: string;

  [key: string]: unknown;
}

export interface ParseMealTextInput {
  text: string;
}

// -----------------------------------------------------------------------------
// Smart meal parser — POST /meals/parse
//
// Layered parser on the backend: pasted nutrition table -> local Filipino food
// database -> manual placeholders. It does not depend on an AI service, and it
// is separate from the legacy POST /meals/parse-ai above.
// -----------------------------------------------------------------------------

/**
 * Where the numbers for a parsed food came from:
 * - table:  read directly from the values the user pasted
 * - db:     estimated from the local food database
 * - ai:     estimated by an optional AI fallback
 * - manual: not recognised, macros are 0 and must be filled in by the user
 */
export type SmartParseSource = 'table' | 'db' | 'ai' | 'manual';

/** Which backend layer produced the overall result. */
export type SmartParserKind = 'table' | 'db' | 'ai' | 'mixed' | 'none';

export type SmartParsedFood = {
  name: string;
  quantity: number;
  unit: string;
  weight_g: number | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: SmartParseSource;
  /** 0..1 */
  confidence: number;
  notes: string | null;
  raw_text: string | null;
};

export interface SmartParsedMeal {
  foods: SmartParsedFood[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  /** 0..1 */
  confidence: number;
  /** true when some items were not recognised and need macros from the user */
  needs_manual_edit: boolean;
  parser: SmartParserKind;
  warnings: string[];
  /** Segments of the input that could not be matched to any food. */
  unmatched: string[];
  meal_type: MealType | null;
  raw_input_prompt: string;
}

export interface ParseMealSmartInput {
  text: string;
  meal_type?: MealType;
}

// -----------------------------------------------------------------------------
// POST /meals/log/batch
//
// Logs every food item as its own meal entry (one row in meal_logs per item)
// in a single request. Unknown extra fields are stored with the food item.
// -----------------------------------------------------------------------------

export interface LogMealItemInput {
  name: string;
  /** Shown as the entry's title. Defaults to `name` on the backend. */
  raw_input_prompt?: string;
  serving_size?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  [key: string]: unknown;
}

export interface LogMealItemsInput {
  meal_type?: MealType;
  items: LogMealItemInput[];
}

// -----------------------------------------------------------------------------
// POST /meals/log
//
// logMeal() accepts either a flat body or a body with a nested `data` object
// (the shape returned by parse-ai). Whichever is present is used as the
// source for foods/macros; meal_type and raw_input_prompt/raw_text may be
// set at either the top level or inside `data`.
// -----------------------------------------------------------------------------

export interface LogMealInput {
  meal_type?: MealType;
  raw_input_prompt?: string;
  raw_text?: string;

  foods?: MealFoodItem[];
  food_items?: MealFoodItem[];

  totalCalories?: number;
  total_calories?: number;

  protein?: number;
  total_protein?: number;

  carbs?: number;
  total_carbs?: number;

  fat?: number;
  total_fat?: number;
}

/**
 * Convenience input when directly logging the result returned by /parse-ai.
 * The backend accepts { data: parsedMeal } alongside optional top-level
 * meal_type / raw_input_prompt / raw_text overrides.
 */
export interface LogParsedMealInput {
  meal_type?: MealType;
  raw_input_prompt?: string;
  raw_text?: string;
  data: ParsedMealData;
}

/**
 * The raw row inserted into `meal_logs` and returned as-is by POST /log.
 * Note this uses the total_* field names (unlike the serialized meal shape
 * returned by the date/week/history endpoints below).
 */
export interface MealLogRecord {
  id: string;
  user_id?: string;
  meal_type: MealType;
  raw_input_prompt: string | null;
  food_items: MealFoodItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  logged_at: string;
  created_at?: string | null;
  [key: string]: unknown;
}

// -----------------------------------------------------------------------------
// Serialized meal shape used by getMealsByDate / getTodayMeals /
// getYesterdayMeals / getWeeklyMeals (the `meals` arrays). Fields are flat
// (calories/protein/carbs/fat) and rounded, unlike MealLogRecord above.
// -----------------------------------------------------------------------------

export interface MealLogSummary {
  id: string;
  meal_type: MealType | null;
  raw_input_prompt: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  food_items: MealFoodItem[];
  logged_at: string | null;
  created_at: string | null;
}

/**
 * Presentation-ready meal shape used by the Meal components. The query layer
 * maps MealLogSummary into this shape so UI components do not need to know
 * about backend field-name differences between POST /log and GET meal views.
 */
export interface MealLog {
  id: MealId;
  meal_type: MealType | null;
  raw_input_prompt: string | null;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  food_items: MealFoodItem[];
  logged_at: string;
  created_at: string | null;
}

export interface MealNutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealTargets {
  daily_calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
}

/** Backwards-compatible summary name used by existing Meal components. */
export type TodayMealSummary = MealNutritionTotals;

// -----------------------------------------------------------------------------
// GET /meals/today | /meals/yesterday | /meals/date/:date
// -----------------------------------------------------------------------------

export interface MealsByDateData {
  date: string;
  meals: MealLogSummary[];
  summary: MealNutritionTotals;
  targets: MealTargets;
  remaining: MealNutritionTotals;
}

export interface MealDayViewData extends Omit<MealsByDateData, 'meals'> {
  meals: MealLog[];
}

// -----------------------------------------------------------------------------
// GET /meals/week
// -----------------------------------------------------------------------------

export interface DailyMealBreakdown extends MealNutritionTotals {
  date: string;
  meals_logged: number;
}

export interface MealPeriodSummary extends MealNutritionTotals {
  average_daily_calories: number;
  average_daily_protein: number;
  average_daily_carbs: number;
  average_daily_fat: number;
  logged_days: number;
}

export interface WeeklyMealsQuery {
  /** YYYY-MM-DD; any day within the desired week. Defaults to today. */
  date?: string;
}

export interface WeeklyMealsData {
  week_start: string;
  week_end: string;
  daily: DailyMealBreakdown[];
  weekly_summary: MealPeriodSummary;
  daily_targets: MealTargets;
  weekly_targets: MealNutritionTotals;
  meals: MealLogSummary[];
}

// -----------------------------------------------------------------------------
// GET /meals/history
// -----------------------------------------------------------------------------

export interface MealHistoryQuery {
  /** 1-365, defaults to 30. */
  days?: number;
}

export interface MealHistoryData {
  start_date: string;
  end_date: string;
  days: number;
  daily: DailyMealBreakdown[];
  period_summary: MealPeriodSummary;
  targets: MealTargets;
}

// -----------------------------------------------------------------------------
// API responses
// -----------------------------------------------------------------------------

export type ParseMealTextResponse = MealApiResponse<ParsedMealData>;
export type ParseMealSmartResponse = MealApiResponse<SmartParsedMeal>;
export type LogMealResponse = MealApiResponse<MealLogRecord>;
export type LogMealItemsResponse = MealApiResponse<MealLogRecord[]>;
export type MealsByDateResponse = MealApiResponse<MealsByDateData>;
export type TodayMealsResponse = MealsByDateResponse;
export type YesterdayMealsResponse = MealsByDateResponse;
export type MealDayViewResponse = MealApiResponse<MealDayViewData>;
export type WeeklyMealsResponse = MealApiResponse<WeeklyMealsData>;
export type MealHistoryResponse = MealApiResponse<MealHistoryData>;
export type DeleteMealResponse = MealMessageResponse;