import { useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import { getFirstName, PageHeader } from '../components/layout/PageHeader'
import { MealContent } from '../components/meal/MealContent'
import { MealErrorState } from '../components/meal/MealErrorState'
import { MealSkeleton } from '../components/meal/MealSkeleton'
import { DeleteMealConfirmModal } from '../components/meal/modals/DeleteMealConfirmModal'
import { ManualMealModal } from '../components/meal/modals/ManualMealModal'
import { MealDetailsModal } from '../components/meal/modals/MealDetailsModal'
import { useDashboard } from '../hooks/useDashboard'
import { useTodayMeals } from '../hooks/useMeal'
import type { DashboardLayoutContext } from '../layouts/MainDashboardLayout'
import type { MealLog } from '../services/types/meal'

const EMPTY_SUMMARY = {
  total_calories: 0,
  total_protein: 0,
  total_carbs: 0,
  total_fat: 0,
}

export function MealsPage() {
  const { openSidebar } = useOutletContext<DashboardLayoutContext>()
  const [search, setSearch] = useState('')
  const [manualOpen, setManualOpen] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<MealLog | null>(null)
  const [mealToDelete, setMealToDelete] = useState<MealLog | null>(null)

  const parserTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  const mealsSectionRef = useRef<HTMLElement | null>(null)

  const mealsQuery = useTodayMeals()
  const dashboardQuery = useDashboard()

  if (mealsQuery.isLoading) {
    return <MealSkeleton />
  }

  if (mealsQuery.isError || !mealsQuery.data) {
    return (
      <MealErrorState
        isRetrying={mealsQuery.isFetching}
        onRetry={() => {
          void mealsQuery.refetch()
          if (dashboardQuery.isError) void dashboardQuery.refetch()
        }}
      />
    )
  }

  const meals = mealsQuery.data.data.meals ?? []
  const summary = mealsQuery.data.data.today_summary ?? EMPTY_SUMMARY
  const dashboard = dashboardQuery.data?.data

  const focusParser = () => {
    const textarea = parserTextareaRef.current
    textarea?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => textarea?.focus(), 350)
  }

  const viewTodayMeals = () => {
    mealsSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <>
      <PageHeader
        title={`Track your meals, ${getFirstName(dashboard?.user.full_name)} 👋`}
        subtitle="Log meals, review macros, and stay on top of your nutrition."
        fullName={dashboard?.user.full_name}
        avatarUrl={dashboard?.user.avatar_url}
        onOpenSidebar={openSidebar}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search meals..."
      />

      <MealContent
        meals={meals}
        summary={summary}
        dashboardNutrition={dashboard?.today.nutrition}
        search={search}
        parserTextareaRef={parserTextareaRef}
        mealsSectionRef={mealsSectionRef}
        onFocusParser={focusParser}
        onOpenManualMeal={() => setManualOpen(true)}
        onViewTodayMeals={viewTodayMeals}
        onSelectMeal={setSelectedMeal}
        onDeleteMeal={setMealToDelete}
      />

      <ManualMealModal
        open={manualOpen}
        onClose={() => setManualOpen(false)}
      />

      <MealDetailsModal
        meal={selectedMeal}
        onClose={() => setSelectedMeal(null)}
      />

      <DeleteMealConfirmModal
        meal={mealToDelete}
        onClose={() => setMealToDelete(null)}
      />
    </>
  )
}