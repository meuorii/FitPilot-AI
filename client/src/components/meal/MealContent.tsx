import type { RefObject } from 'react'

import type { DashboardNutrition } from '../../services/types/dashboard'
import type { MealLog, MealTargets, TodayMealSummary } from '../../services/types/meal'
import { AIMealParser } from './AIMealParser'
import { buildNutritionView, formatMealDateKey } from './meal.utils'
import { MealHero } from './MealHero'
import { MealTips } from './MealTips'
import { NutritionSummary } from './NutritionSummary'
import { QuickMealActions } from './QuickMealActions'
import { TodayIntakeCard } from './TodayIntakeCard'
import { TodayMealsList } from './TodayMealsList'

interface MealContentProps {
  meals: MealLog[]
  summary: TodayMealSummary
  targets: MealTargets
  dashboardNutrition?: DashboardNutrition
  date: string
  isToday: boolean
  search: string
  parserTextareaRef: RefObject<HTMLTextAreaElement | null>
  mealsSectionRef: RefObject<HTMLElement | null>
  onFocusParser: () => void
  onOpenManualMeal: () => void
  onViewTodayMeals: () => void
  onViewHistory: () => void
  onSelectMeal: (meal: MealLog) => void
  onDeleteMeal: (meal: MealLog) => void
}

export function MealContent({
  meals,
  summary,
  targets,
  dashboardNutrition,
  date,
  isToday,
  search,
  parserTextareaRef,
  mealsSectionRef,
  onFocusParser,
  onOpenManualMeal,
  onViewTodayMeals,
  onViewHistory,
  onSelectMeal,
  onDeleteMeal,
}: MealContentProps) {
  const nutrition = buildNutritionView(summary, dashboardNutrition, targets)
  const dateLabel = isToday ? 'Today' : formatMealDateKey(date)

  return (
    <div className="space-y-5">
      <div className="grid gap-5 2xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <MealHero onParseAI={onFocusParser} />
        <TodayIntakeCard
          nutrition={nutrition}
          mealsCount={meals.length}
          dateLabel={dateLabel}
          isToday={isToday}
        />
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <div className="min-w-0 space-y-5">
          <AIMealParser textareaRef={parserTextareaRef} />
          <NutritionSummary
            nutrition={nutrition}
            mealsCount={meals.length}
            dateLabel={dateLabel}
          />
          <TodayMealsList
            meals={meals}
            search={search}
            sectionRef={mealsSectionRef}
            dateLabel={dateLabel}
            isToday={isToday}
            onSelectMeal={onSelectMeal}
            onDeleteMeal={onDeleteMeal}
            onParseAI={onFocusParser}
            onLogManual={onOpenManualMeal}
          />
        </div>

        <aside className="min-w-0 space-y-5">
          <QuickMealActions
            onParseAI={onFocusParser}
            onLogManual={onOpenManualMeal}
            onViewToday={onViewTodayMeals}
            onViewHistory={onViewHistory}
          />
          <MealTips />
        </aside>
      </div>
    </div>
  )
}
