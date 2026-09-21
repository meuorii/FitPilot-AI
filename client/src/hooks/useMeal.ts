import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  deleteMeal,
  getTodayMeals,
  logMeal,
  logParsedMeal,
  parseMealText,
} from '../services/api/meal'
import type {
  LogMealInput,
  LogParsedMealInput,
  ParseMealTextInput,
} from '../services/types/meal'
import { dashboardQueryKey } from './useDashboard'

export const mealQueryKeys = {
  all: ['meals'] as const,
  today: () => [...mealQueryKeys.all, 'today'] as const,
}

export const useTodayMeals = () =>
  useQuery({
    queryKey: mealQueryKeys.today(),
    queryFn: getTodayMeals,
    staleTime: 15_000,
  })

export const useParseMeal = () =>
  useMutation({
    mutationFn: (input: ParseMealTextInput) => parseMealText(input),
  })

const invalidateMealAndDashboard = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: mealQueryKeys.today() }),
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
