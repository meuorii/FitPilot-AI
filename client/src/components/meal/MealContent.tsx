import type { RefObject } from 'react'
import type { DashboardNutrition } from '../../services/types/dashboard'
import type { MealHistoryData, MealLog, MealTargets, TodayMealSummary, WeeklyMealsData } from '../../services/types/meal'
import { AIMealParser } from './AIMealParser'
import { buildNutritionView, formatMealDateKey } from './meal.utils'
import { MealHero } from './MealHero'
import { MealTips } from './MealTips'
import { QuickMealActions } from './QuickMealActions'
import { TodayMealsList } from './TodayMealsList'
import { MealCalendar } from './MealCalendar'
import { DailyNutritionOverview } from './DailyNutritionOverview'

interface MealContentProps {
  meals: MealLog[]
  summary: TodayMealSummary
  targets: MealTargets
  dashboardNutrition?: DashboardNutrition
  date: string
  isToday: boolean
  search: string
  week?: WeeklyMealsData
  history?: MealHistoryData
  parserTextareaRef: RefObject<HTMLTextAreaElement | null>
  mealsSectionRef: RefObject<HTMLElement | null>
  onDateChange: (date: string) => void
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
  week,
  history,
  parserTextareaRef,
  mealsSectionRef,
  onDateChange,
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
    <div className="space-y-6">
      <MealHero onParseAI={onFocusParser} />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(330px,0.85fr)]">
        <DailyNutritionOverview
          nutrition={nutrition}
          mealsCount={meals.length}
          dateLabel={dateLabel}
          isToday={isToday}
        />
        <MealCalendar
          value={date}
          week={week}
          history={history}
          onChange={onDateChange}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
        <div className="min-w-0 space-y-5">
          <AIMealParser textareaRef={parserTextareaRef} />
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
      </section>
    </div>
  )
}
