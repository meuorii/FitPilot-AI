import type { RefObject } from 'react'
import { BarChart3, CalendarRange, Loader2, Utensils } from 'lucide-react'
import type { MealHistoryData, MealPeriodSummary, WeeklyMealsData } from '../../services/types/meal'
import { formatDateRange, formatMacroNumber, formatMealDateKey } from './meal.utils'

interface MealHistoryPanelProps {
  week: WeeklyMealsData | undefined
  history: MealHistoryData | undefined
  isWeekLoading: boolean
  isHistoryLoading: boolean
  weekError: boolean
  historyError: boolean
  selectedDate: string
  onSelectDate: (date: string) => void
  sectionRef: RefObject<HTMLElement | null>
}

const summaryItems = (summary: MealPeriodSummary) => [
  ['Calories', `${Math.round(summary.calories).toLocaleString()} kcal`],
  ['Protein', `${formatMacroNumber(summary.protein)}g`],
  ['Carbs', `${formatMacroNumber(summary.carbs)}g`],
  ['Fat', `${formatMacroNumber(summary.fat)}g`],
]

const percentage = (value: number, target: number) =>
  target > 0 ? Math.min(100, Math.max(0, Math.round((value / target) * 100))) : 0

export function MealHistoryPanel({
  week,
  history,
  isWeekLoading,
  isHistoryLoading,
  weekError,
  historyError,
  selectedDate,
  onSelectDate,
  sectionRef,
}: MealHistoryPanelProps) {
  return (
    <section ref={sectionRef} id="meal-history" className="mt-6 space-y-6">
      <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(56,50,63,0.045)] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CalendarRange className="h-5 w-5 text-[#7482A4]" />
              <h2 className="text-xl font-extrabold tracking-[-0.03em] text-[#38323F]">Weekly Nutrition</h2>
            </div>
            <p className="mt-1 text-xs text-[#8B8690]">Total intake and daily rhythm for the selected week.</p>
          </div>
          {week && (
            <span className="rounded-full bg-[#7482A4]/10 px-3 py-1.5 text-[10px] font-extrabold text-[#7482A4]">
              {formatDateRange(week.week_start, week.week_end)}
            </span>
          )}
        </div>

        {isWeekLoading ? (
          <Loading label="Loading weekly nutrition…" />
        ) : weekError || !week ? (
          <Unavailable label="Weekly nutrition is unavailable right now." />
        ) : (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {summaryItems(week.weekly_summary).map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-[#F8F7FA] p-4">
                  <p className="text-[10px] font-bold text-[#8B8690]">{label}</p>
                  <p className="mt-1 text-base font-extrabold text-[#38323F]">{value}</p>
                </div>
              ))}
              <div className="rounded-2xl bg-[#F8F7FA] p-4">
                <p className="text-[10px] font-bold text-[#8B8690]">Meals logged</p>
                <p className="mt-1 text-base font-extrabold text-[#38323F]">
                  {week.daily.reduce((sum, day) => sum + day.meals_logged, 0)}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {week.daily.map((day) => {
                const isSelected = day.date === selectedDate
                const caloriePct = percentage(day.calories, week.daily_targets.daily_calories)
                return (
                  <button
                    type="button"
                    key={day.date}
                    onClick={() => onSelectDate(day.date)}
                    className={[
                      'w-full rounded-2xl p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]',
                      isSelected ? 'bg-[#7482A4]/10' : 'bg-[#FCFBFD] hover:bg-[#F8F7FA]',
                    ].join(' ')}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="min-w-[120px] flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-extrabold text-[#38323F]">{formatMealDateKey(day.date)}</p>
                          {isSelected && (
                            <span className="rounded-full bg-[#7482A4] px-2 py-0.5 text-[9px] font-extrabold text-white">Selected</span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[10px] font-semibold text-[#8B8690]">
                          {day.meals_logged} meal{day.meals_logged === 1 ? '' : 's'} logged
                        </p>
                      </div>

                      <div className="w-full min-w-[150px] flex-[1.3]">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-[#8B8690]">Calories</span>
                          <span className="font-extrabold text-[#38323F]">{Math.round(day.calories).toLocaleString()} kcal</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E7E5EA]">
                          <div className="h-full rounded-full bg-[#7482A4]" style={{ width: `${caloriePct}%` }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[10px] sm:min-w-[245px]">
                        <Macro label="Protein" value={`${formatMacroNumber(day.protein)}g`} />
                        <Macro label="Carbs" value={`${formatMacroNumber(day.carbs)}g`} />
                        <Macro label="Fat" value={`${formatMacroNumber(day.fat)}g`} />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </section>

      <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(56,50,63,0.045)] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#7482A4]" />
              <h2 className="text-xl font-extrabold tracking-[-0.03em] text-[#38323F]">Meal History</h2>
            </div>
            <p className="mt-1 text-xs text-[#8B8690]">Your last 30 days of nutrition, presented as intake history.</p>
          </div>
          {history && (
            <span className="rounded-full bg-[#7482A4]/10 px-3 py-1.5 text-[10px] font-extrabold text-[#7482A4]">
              Last {history.days} days
            </span>
          )}
        </div>

        {isHistoryLoading ? (
          <Loading label="Loading meal history…" />
        ) : historyError || !history ? (
          <Unavailable label="Meal history is unavailable right now." />
        ) : (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {summaryItems(history.period_summary).map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-[#F8F7FA] p-4">
                  <p className="text-[10px] font-bold text-[#8B8690]">{label}</p>
                  <p className="mt-1 text-base font-extrabold text-[#38323F]">{value}</p>
                </div>
              ))}
              <div className="rounded-2xl bg-[#F8F7FA] p-4">
                <p className="text-[10px] font-bold text-[#8B8690]">Logged days</p>
                <p className="mt-1 text-base font-extrabold text-[#38323F]">{history.period_summary.logged_days}</p>
              </div>
              <div className="rounded-2xl bg-[#F8F7FA] p-4">
                <p className="text-[10px] font-bold text-[#8B8690]">Avg. calories/day</p>
                <p className="mt-1 text-base font-extrabold text-[#38323F]">
                  {Math.round(history.period_summary.average_daily_calories).toLocaleString()} kcal
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {[...history.daily].reverse().map((day) => {
                const isSelected = day.date === selectedDate
                return (
                  <button
                    type="button"
                    key={day.date}
                    onClick={() => onSelectDate(day.date)}
                    className={[
                      'flex w-full flex-col gap-3 rounded-2xl p-4 text-left transition sm:flex-row sm:items-center',
                      isSelected ? 'bg-[#7482A4]/10' : 'bg-[#FCFBFD] hover:bg-[#F8F7FA]',
                    ].join(' ')}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#7482A4]/10 text-[#7482A4]">
                        <Utensils className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-[#38323F]">{formatMealDateKey(day.date)}</p>
                        <p className="text-[10px] font-semibold text-[#8B8690]">
                          {day.meals_logged} meal{day.meals_logged === 1 ? '' : 's'} logged
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-5 gap-y-1 text-[10px] sm:grid-cols-4">
                      <Metric label="Calories" value={`${Math.round(day.calories).toLocaleString()} kcal`} />
                      <Metric label="Protein" value={`${formatMacroNumber(day.protein)}g`} />
                      <Metric label="Carbs" value={`${formatMacroNumber(day.carbs)}g`} />
                      <Metric label="Fat" value={`${formatMacroNumber(day.fat)}g`} />
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </section>
    </section>
  )
}

function Macro({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[#8B8690]">{label}</p>
      <p className="mt-0.5 font-extrabold text-[#38323F]">{value}</p>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[#8B8690]">{label}</p>
      <p className="mt-0.5 font-extrabold text-[#38323F]">{value}</p>
    </div>
  )
}

function Loading({ label }: { label: string }) {
  return (
    <div className="mt-5 flex items-center justify-center rounded-2xl bg-[#FAF9FB] px-5 py-10 text-xs font-semibold text-[#8B8690]">
      <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#7482A4]" />
      {label}
    </div>
  )
}

function Unavailable({ label }: { label: string }) {
  return (
    <div className="mt-5 rounded-2xl bg-[#FAF9FB] px-5 py-10 text-center text-xs font-semibold text-[#8B8690]">
      {label}
    </div>
  )
}
