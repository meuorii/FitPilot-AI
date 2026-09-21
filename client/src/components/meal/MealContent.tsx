import type { RefObject } from 'react'

import type { DashboardNutrition } from '../../services/types/dashboard'
import type { MealLog, TodayMealSummary } from '../../services/types/meal'
import { AIMealParser } from './AIMealParser'
import { buildNutritionView, formatMealDate } from './meal.utils'
import { MealHero } from './MealHero'
import { MealTips } from './MealTips'
import { NutritionSummary } from './NutritionSummary'
import { QuickMealActions } from './QuickMealActions'
import { TodayIntakeCard } from './TodayIntakeCard'
import { TodayMealsList } from './TodayMealsList'

interface MealContentProps {
  meals: MealLog[]
  summary: TodayMealSummary
  dashboardNutrition?: DashboardNutrition
  search: string
  parserTextareaRef: RefObject<HTMLTextAreaElement | null>
  mealsSectionRef: RefObject<HTMLElement | null>
  onFocusParser: () => void
  onOpenManualMeal: () => void
  onViewTodayMeals: () => void
  onSelectMeal: (meal: MealLog) => void
  onDeleteMeal: (meal: MealLog) => void
}

export function MealContent({
  meals,
  summary,
  dashboardNutrition,
  search,
  parserTextareaRef,
  mealsSectionRef,
  onFocusParser,
  onOpenManualMeal,
  onViewTodayMeals,
  onSelectMeal,
  onDeleteMeal,
}: MealContentProps) {
  const nutrition = buildNutritionView(summary, dashboardNutrition)

  return (
    <div className="space-y-5">
      <div className="grid gap-5 2xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <MealHero onParseAI={onFocusParser} />
        <TodayIntakeCard
          nutrition={nutrition}
          mealsCount={meals.length}
          dateLabel={formatMealDate()}
        />
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <div className="min-w-0 space-y-5">
          <AIMealParser textareaRef={parserTextareaRef} />
          <NutritionSummary nutrition={nutrition} mealsCount={meals.length} />
          <TodayMealsList
            meals={meals}
            search={search}
            sectionRef={mealsSectionRef}
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
          />
          <MealTips />
        </aside>
      </div>
    </div>
  )
}
