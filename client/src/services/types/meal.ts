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

export interface MealLog {
  id: MealId;
  user_id: string;
  meal_type: MealType;
  raw_input_prompt: string | null;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  food_items: MealFoodItem[];
  logged_at: string;
  created_at: string;
}

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
 * The backend also accepts { data: parsedMeal }.
 */
export interface LogParsedMealInput {
  meal_type?: MealType;
  raw_input_prompt?: string;
  raw_text?: string;
  data: ParsedMealData;
}

export interface TodayMealSummary {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

export interface TodayMealsData {
  meals: MealLog[];
  today_summary: TodayMealSummary;
}

export type ParseMealTextResponse = MealApiResponse<ParsedMealData>;
export type LogMealResponse = MealApiResponse<MealLog>;
export type TodayMealsResponse = MealApiResponse<TodayMealsData>;
export type DeleteMealResponse = MealMessageResponse;