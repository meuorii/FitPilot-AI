import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  deleteMeal,
  getMealHistory,
  getMealsByDate,
  getTodayMeals,
  getWeeklyMeals,
  getYesterdayMeals,
  logMeal,
  logParsedMeal,
  parseMealText,
} from '../services/api/meal'
import type {
  LogMealInput,
  LogParsedMealInput,
  MealDayViewResponse,
  MealHistoryQuery,
  MealHistoryResponse,
  ParseMealTextInput,
  WeeklyMealsQuery,
  WeeklyMealsResponse,
} from '../services/types/meal'
import { dashboardQueryKey } from './useDashboard'

const getLocalDateKey = (value: Date = new Date()): string => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const shiftDateKey = (date: string, days: number): string => {
  const [year, month, day] = date.split('-').map(Number)
  const value = new Date(year, month - 1, day)
  value.setDate(value.getDate() + days)
  return getLocalDateKey(value)
}

const normalizeMealLog = (meal: Awaited<ReturnType<typeof getTodayMeals>>['data']['meals'][number]) => {
  const toNonNegativeNumber = (value: number): number => {
    const number = Number(value)
    return Number.isFinite(number) && number >= 0 ? number : 0
  }

  return {
    id: meal.id,
    meal_type: meal.meal_type,
    raw_input_prompt: meal.raw_input_prompt,
    total_calories: toNonNegativeNumber(meal.calories),
    total_protein: toNonNegativeNumber(meal.protein),
    total_carbs: toNonNegativeNumber(meal.carbs),
    total_fat: toNonNegativeNumber(meal.fat),
    food_items: Array.isArray(meal.food_items) ? meal.food_items : [],
    logged_at: meal.logged_at ?? '',
    created_at: meal.created_at,
  }
}

export const mealQueryKeys = {
  all: ['meals'] as const,
  today: () => [...mealQueryKeys.all, 'today'] as const,
  yesterday: () => [...mealQueryKeys.all, 'yesterday'] as const,
  date: (date: string) => [...mealQueryKeys.all, 'date', date] as const,
  week: (date: string) => [...mealQueryKeys.all, 'week', date] as const,
  history: (days: number) => [...mealQueryKeys.all, 'history', days] as const,
}

const normalizeDayResponse = (response: Awaited<ReturnType<typeof getTodayMeals>>): MealDayViewResponse => ({
  ...response,
  data: {
    ...response.data,
    meals: response.data.meals.map(normalizeMealLog),
  },
})

const getMealsForDate = async (date: string): Promise<MealDayViewResponse> => {
  const today = getLocalDateKey()
  const yesterday = shiftDateKey(today, -1)

  if (date === today) return normalizeDayResponse(await getTodayMeals())
  if (date === yesterday) return normalizeDayResponse(await getYesterdayMeals())
  return normalizeDayResponse(await getMealsByDate(date))
}

export const useTodayMeals = () =>
  useQuery({
    queryKey: mealQueryKeys.today(),
    queryFn: async () => normalizeDayResponse(await getTodayMeals()),
    staleTime: 15_000,
  })

export const useMealsForDate = (date: string) =>
  useQuery({
    queryKey: mealQueryKeys.date(date),
    queryFn: () => getMealsForDate(date),
    staleTime: 15_000,
    enabled: Boolean(date),
  })

export const useWeeklyMeals = (query: WeeklyMealsQuery = {}) =>
  useQuery<WeeklyMealsResponse, Error>({
    queryKey: mealQueryKeys.week(query.date ?? getLocalDateKey()),
    queryFn: () => getWeeklyMeals(query),
    staleTime: 30_000,
    enabled: Boolean(query.date ?? getLocalDateKey()),
  })

export const useMealHistory = (query: MealHistoryQuery = {}) => {
  const days = query.days ?? 30

  return useQuery<MealHistoryResponse, Error>({
    queryKey: mealQueryKeys.history(days),
    queryFn: () => getMealHistory(query),
    staleTime: 60_000,
  })
}

export const useParseMeal = () =>
  useMutation({
    mutationFn: (input: ParseMealTextInput) => parseMealText(input),
  })

const invalidateMealAndDashboard = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: mealQueryKeys.all }),
    queryClient.invalidateQueries({ queryKey: dashboardQueryKey }),
  ])
}

export const useLogMeal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: LogMealInput) => logMeal(input),
    onSuccess: async () => invalidateMealAndDashboard(queryClient),
  })
}

export const useLogParsedMeal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: LogParsedMealInput) => logParsedMeal(input),
    onSuccess: async () => invalidateMealAndDashboard(queryClient),
  })
}

export const useDeleteMeal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (mealId: string) => deleteMeal(mealId),
    onSuccess: async () => invalidateMealAndDashboard(queryClient),
  })
}
