import type { RefObject } from 'react'
import { BarChart3, CalendarRange, Loader2 } from 'lucide-react'

import type {
  MealHistoryData,
  MealPeriodSummary,
  WeeklyMealsData,
} from '../../services/types/meal'
import {
  formatDateRange,
  formatMacroNumber,
  formatMealDateKey,
} from './meal.utils'

interface MealHistoryPanelProps {
  week: WeeklyMealsData | undefined
  history: MealHistoryData | undefined
  isWeekLoading: boolean
  isHistoryLoading: boolean
  weekError: boolean
  historyError: boolean
  sectionRef: RefObject<HTMLElement | null>
}

const summaryItems = (summary: MealPeriodSummary) => [
  ['Calories', `${Math.round(summary.calories).toLocaleString()} kcal`],
  ['Protein', `${formatMacroNumber(summary.protein)}g`],
  ['Carbs', `${formatMacroNumber(summary.carbs)}g`],
  ['Fat', `${formatMacroNumber(summary.fat)}g`],
]

export function MealHistoryPanel({
  week,
  history,
  isWeekLoading,
  isHistoryLoading,
  weekError,
  historyError,
  sectionRef,
}: MealHistoryPanelProps) {
  return (
    <section
      ref={sectionRef}
      id="meal-history"
      className="mt-5 space-y-5"
    >
      <div className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CalendarRange className="h-5 w-5 text-[#7482A4]" />
              <h2 className="text-lg font-extrabold tracking-[-0.02em] text-[#38323F]">
                Weekly Nutrition
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#8B8690]">
              Review your daily nutrition totals across the selected week.
            </p>
          </div>
          {week ? (
            <span className="rounded-full bg-[#7482A4]/10 px-3 py-1.5 text-[10px] font-extrabold text-[#7482A4]">
              {formatDateRange(week.week_start, week.week_end)}
            </span>
          ) : null}
        </div>

        {isWeekLoading ? (
          <div className="mt-5 flex items-center justify-center rounded-2xl border border-dashed border-[#7482A4]/20 bg-[#FAF9FB] px-5 py-10 text-xs font-semibold text-[#8B8690]">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#7482A4]" />
            Loading weekly nutrition…
          </div>
        ) : weekError || !week ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[#7482A4]/20 bg-[#FAF9FB] px-5 py-10 text-center text-xs font-semibold text-[#8B8690]">
            Weekly nutrition is unavailable right now.
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {summaryItems(week.weekly_summary).map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[#7482A4]/10 bg-[#FCFBFD] p-3"
                >
                  <p className="text-[10px] font-semibold text-[#8B8690]">{label}</p>
                  <p className="mt-1 text-sm font-extrabold text-[#38323F]">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-[#7482A4]/10">
              <div className="min-w-[640px]">
                <div className="grid grid-cols-[1.3fr_repeat(5,1fr)] gap-2 bg-[#FAF9FB] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.05em] text-[#8B8690]">
                  <span>Day</span>
                  <span>Meals</span>
                  <span>Calories</span>
                  <span>Protein</span>
                  <span>Carbs</span>
                  <span>Fat</span>
                </div>
                <div className="divide-y divide-[#7482A4]/10">
                  {week.daily.map((day) => (
                    <div
                      key={day.date}
                      className="grid grid-cols-[1.3fr_repeat(5,1fr)] gap-2 px-4 py-3 text-xs"
                    >
                      <span className="font-extrabold text-[#38323F]">
                        {formatMealDateKey(day.date)}
                      </span>
                      <span className="font-semibold text-[#5F5A64]">{day.meals_logged}</span>
                      <span className="font-semibold text-[#5F5A64]">
                        {Math.round(day.calories).toLocaleString()}
                      </span>
                      <span className="font-semibold text-[#5F5A64]">{formatMacroNumber(day.protein)}g</span>
                      <span className="font-semibold text-[#5F5A64]">{formatMacroNumber(day.carbs)}g</span>
                      <span className="font-semibold text-[#5F5A64]">{formatMacroNumber(day.fat)}g</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#7482A4]" />
              <h2 className="text-lg font-extrabold tracking-[-0.02em] text-[#38323F]">
                Meal History
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#8B8690]">
              Your recent daily meal logging and nutrition overview.
            </p>
          </div>
          {history ? (
            <span className="rounded-full bg-[#7482A4]/10 px-3 py-1.5 text-[10px] font-extrabold text-[#7482A4]">
              {history.days} days
            </span>
          ) : null}
        </div>

        {isHistoryLoading ? (
          <div className="mt-5 flex items-center justify-center rounded-2xl border border-dashed border-[#7482A4]/20 bg-[#FAF9FB] px-5 py-10 text-xs font-semibold text-[#8B8690]">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#7482A4]" />
            Loading meal history…
          </div>
        ) : historyError || !history ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[#7482A4]/20 bg-[#FAF9FB] px-5 py-10 text-center text-xs font-semibold text-[#8B8690]">
            Meal history is unavailable right now.
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {summaryItems(history.period_summary).map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[#7482A4]/10 bg-[#FCFBFD] p-3"
                >
                  <p className="text-[10px] font-semibold text-[#8B8690]">{label}</p>
                  <p className="mt-1 text-sm font-extrabold text-[#38323F]">{value}</p>
                </div>
              ))}
            </div>

            <p className="mt-3 text-[11px] font-semibold text-[#8B8690]">
              {formatDateRange(history.start_date, history.end_date)} · {history.period_summary.logged_days} day(s) with meals logged
            </p>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-[#7482A4]/10">
              <div className="min-w-[640px]">
                <div className="grid grid-cols-[1.3fr_repeat(5,1fr)] gap-2 bg-[#FAF9FB] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.05em] text-[#8B8690]">
                  <span>Day</span>
                  <span>Meals</span>
                  <span>Calories</span>
                  <span>Protein</span>
                  <span>Carbs</span>
                  <span>Fat</span>
                </div>
                <div className="divide-y divide-[#7482A4]/10">
                  {history.daily.map((day) => (
                    <div
                      key={day.date}
                      className="grid grid-cols-[1.3fr_repeat(5,1fr)] gap-2 px-4 py-3 text-xs"
                    >
                      <span className="font-extrabold text-[#38323F]">
                        {formatMealDateKey(day.date)}
                      </span>
                      <span className="font-semibold text-[#5F5A64]">{day.meals_logged}</span>
                      <span className="font-semibold text-[#5F5A64]">
                        {Math.round(day.calories).toLocaleString()}
                      </span>
                      <span className="font-semibold text-[#5F5A64]">{formatMacroNumber(day.protein)}g</span>
                      <span className="font-semibold text-[#5F5A64]">{formatMacroNumber(day.carbs)}g</span>
                      <span className="font-semibold text-[#5F5A64]">{formatMacroNumber(day.fat)}g</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
