import type { DashboardNutrition } from '../../services/types/dashboard'
import type {
  MealFoodItem,
  MealLog,
  ParsedMealData,
  TodayMealSummary,
} from '../../services/types/meal'

export type NutritionKey = 'calories' | 'protein' | 'carbs' | 'fat'

export interface NutritionMetricView {
  key: NutritionKey
  label: string
  consumed: number
  target: number
  percentage: number
  unit: 'kcal' | 'g'
}

export interface MealNutritionView {
  calories: NutritionMetricView
  protein: NutritionMetricView
  carbs: NutritionMetricView
  fat: NutritionMetricView
}

export interface NormalizedParsedMeal {
  foods: MealFoodItem[]
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
}

export const safeNumber = (value: unknown): number => {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : 0
}

export const clampPercentage = (consumed: number, target: number): number => {
  if (!Number.isFinite(target) || target <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((consumed / target) * 100)))
}

export const buildNutritionView = (
  summary: TodayMealSummary,
  dashboardNutrition?: DashboardNutrition,
): MealNutritionView => {
  const buildMetric = (
    key: NutritionKey,
    label: string,
    consumed: number,
    target: number,
    unit: 'kcal' | 'g',
  ): NutritionMetricView => ({
    key,
    label,
    consumed: safeNumber(consumed),
    target: safeNumber(target),
    percentage: clampPercentage(safeNumber(consumed), safeNumber(target)),
    unit,
  })

  return {
    calories: buildMetric(
      'calories',
      'Calories',
      summary.total_calories,
      dashboardNutrition?.calories.target ?? 0,
      'kcal',
    ),
    protein: buildMetric(
      'protein',
      'Protein',
      summary.total_protein,
      dashboardNutrition?.protein.target ?? 0,
      'g',
    ),
    carbs: buildMetric(
      'carbs',
      'Carbs',
      summary.total_carbs,
      dashboardNutrition?.carbs.target ?? 0,
      'g',
    ),
    fat: buildMetric(
      'fat',
      'Fat',
      summary.total_fat,
      dashboardNutrition?.fat.target ?? 0,
      'g',
    ),
  }
}

export const getFoodName = (item: MealFoodItem): string => {
  const value = item.name ?? item.food_name
  return typeof value === 'string' && value.trim() ? value.trim() : 'Food item'
}

export const getFoodServing = (item: MealFoodItem): string | null => {
  const serving = item.serving_size ?? item.serving ?? item.quantity ?? item.amount
  const unit = typeof item.unit === 'string' ? item.unit.trim() : ''

  if (serving === undefined || serving === null || serving === '') return null
  return `${String(serving)}${unit ? ` ${unit}` : ''}`
}

export const getFoodImageUrl = (item: MealFoodItem): string | null => {
  const image = item.image_url ?? item.imageUrl ?? item.image
  return typeof image === 'string' && image.trim() ? image.trim() : null
}

export const normalizeParsedMeal = (
  value: ParsedMealData,
): NormalizedParsedMeal => ({
  foods: Array.isArray(value.foods)
    ? value.foods
    : Array.isArray(value.food_items)
      ? value.food_items
      : [],
  total_calories: safeNumber(value.total_calories ?? value.totalCalories),
  total_protein: safeNumber(value.total_protein ?? value.protein),
  total_carbs: safeNumber(value.total_carbs ?? value.carbs),
  total_fat: safeNumber(value.total_fat ?? value.fat),
})

export const getMealTitle = (meal: MealLog): string => {
  if (meal.raw_input_prompt?.trim()) return meal.raw_input_prompt.trim()

  const names = (meal.food_items ?? [])
    .map(getFoodName)
    .filter(Boolean)
    .slice(0, 3)

  if (names.length > 0) return names.join(', ')

  const type = String(meal.meal_type || 'meal')
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export const getMealSecondaryText = (meal: MealLog): string => {
  const names = (meal.food_items ?? []).map(getFoodName).filter(Boolean)
  if (names.length === 0) return 'Nutrition logged in FitPilot'
  return names.slice(0, 4).join(', ')
}

export const getMealSearchText = (meal: MealLog): string =>
  [
    meal.meal_type,
    meal.raw_input_prompt,
    ...(meal.food_items ?? []).map(getFoodName),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

export const getMealImageUrl = (meal: MealLog): string | null => {
  for (const item of meal.food_items ?? []) {
    const image = getFoodImageUrl(item)
    if (image) return image
  }
  return null
}

export const formatNutritionAmount = (
  value: number,
  unit: 'kcal' | 'g',
): string => {
  const safe = safeNumber(value)
  if (unit === 'kcal') return `${Math.round(safe).toLocaleString()} kcal`
  const rounded = Math.round(safe * 10) / 10
  return `${rounded.toLocaleString()}g`
}

export const formatMacroNumber = (value: number): string => {
  const safe = safeNumber(value)
  const rounded = Math.round(safe * 10) / 10
  return rounded.toLocaleString()
}

export const formatMealTime = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Time unavailable'

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export const formatMealDate = (value: Date = new Date()): string =>
  new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(value)

export const getDefaultMealType = (hour = new Date().getHours()) => {
  if (hour < 10) return 'breakfast' as const
  if (hour < 15) return 'lunch' as const
  if (hour < 20) return 'dinner' as const
  return 'snack' as const
}
