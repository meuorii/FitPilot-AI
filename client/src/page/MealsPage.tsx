import { useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import { getFirstName, PageHeader } from '../components/layout/PageHeader'
import { MealContent } from '../components/meal/MealContent'
import { MealDateNavigator } from '../components/meal/MealDateNavigator'
import { MealErrorState } from '../components/meal/MealErrorState'
import { MealHistoryPanel } from '../components/meal/MealHistoryPanel'
import { MealSkeleton } from '../components/meal/MealSkeleton'
import { DeleteMealConfirmModal } from '../components/meal/modals/DeleteMealConfirmModal'
import { ManualMealModal } from '../components/meal/modals/ManualMealModal'
import { MealDetailsModal } from '../components/meal/modals/MealDetailsModal'
import { useDashboard } from '../hooks/useDashboard'
import {
  useMealHistory,
  useMealsForDate,
  useWeeklyMeals,
} from '../hooks/useMeal'
import {
  formatMealDateKey,
  getLocalDateKey,
} from '../components/meal/meal.utils'
import type { DashboardLayoutContext } from '../layouts/MainDashboardLayout'
import type { MealLog } from '../services/types/meal'

const EMPTY_SUMMARY = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
}

const EMPTY_TARGETS = {
  daily_calories: 0,
  protein_grams: 0,
  carbs_grams: 0,
  fat_grams: 0,
}

export function MealsPage() {
  const { openSidebar } = useOutletContext<DashboardLayoutContext>()
  const [search, setSearch] = useState('')
  const [selectedDate, setSelectedDate] = useState(getLocalDateKey())
  const [manualOpen, setManualOpen] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<MealLog | null>(null)
  const [mealToDelete, setMealToDelete] = useState<MealLog | null>(null)

  const parserTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  const mealsSectionRef = useRef<HTMLElement | null>(null)
  const historySectionRef = useRef<HTMLElement | null>(null)

  const today = getLocalDateKey()
  const isToday = selectedDate === today
  const mealsQuery = useMealsForDate(selectedDate)
  const weeklyQuery = useWeeklyMeals({ date: selectedDate })
  const historyQuery = useMealHistory({ days: 30 })
  const dashboardQuery = useDashboard()

  if (mealsQuery.isLoading) {
    return <MealSkeleton />
  }

  if (mealsQuery.isError || !mealsQuery.data) {
    return (
      <MealErrorState
        dateLabel={isToday ? 'today' : formatMealDateKey(selectedDate)}
        isRetrying={mealsQuery.isFetching}
        onRetry={() => {
          void mealsQuery.refetch()
          if (dashboardQuery.isError) void dashboardQuery.refetch()
        }}
      />
    )
  }

  const dayData = mealsQuery.data.data
  const meals = dayData.meals ?? []
  const summary = dayData.summary ?? EMPTY_SUMMARY
  const targets = dayData.targets ?? EMPTY_TARGETS
  const dashboard = dashboardQuery.data?.data

  const focusParser = () => {
    if (!isToday) setSelectedDate(today)
    const textarea = parserTextareaRef.current
    textarea?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => textarea?.focus(), 350)
  }

  const openManualMeal = () => {
    if (!isToday) setSelectedDate(today)
    setManualOpen(true)
  }

  const viewTodayMeals = () => {
    if (!isToday) {
      setSelectedDate(today)
      window.setTimeout(() => {
        mealsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
      return
    }

    mealsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const viewHistory = () => {
    historySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleDateChange = (date: string) => {
    if (!date || date > today) return
    setSelectedMeal(null)
    setMealToDelete(null)
    setSelectedDate(date)
    setSearch('')
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

      <MealDateNavigator
        value={selectedDate}
        onChange={handleDateChange}
        onViewHistory={viewHistory}
      />

      <MealContent
        meals={meals}
        summary={summary}
        targets={targets}
        dashboardNutrition={dashboard?.today.nutrition}
        date={selectedDate}
        isToday={isToday}
        search={search}
        parserTextareaRef={parserTextareaRef}
        mealsSectionRef={mealsSectionRef}
        onFocusParser={focusParser}
        onOpenManualMeal={openManualMeal}
        onViewTodayMeals={viewTodayMeals}
        onViewHistory={viewHistory}
        onSelectMeal={setSelectedMeal}
        onDeleteMeal={setMealToDelete}
      />

      <MealHistoryPanel
        week={weeklyQuery.data?.data}
        history={historyQuery.data?.data}
        isWeekLoading={weeklyQuery.isLoading}
        isHistoryLoading={historyQuery.isLoading}
        weekError={weeklyQuery.isError}
        historyError={historyQuery.isError}
        sectionRef={historySectionRef}
      />

      <ManualMealModal
        open={manualOpen}
        onClose={() => setManualOpen(false)}
      />

      <MealDetailsModal
        meal={selectedMeal}
        onClose={() => setSelectedMeal(null)}
        onDelete={(meal) => setMealToDelete(meal)}
      />

      <DeleteMealConfirmModal
        meal={mealToDelete}
        onClose={() => setMealToDelete(null)}
      />
    </>
  )
}
