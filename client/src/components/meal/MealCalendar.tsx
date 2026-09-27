import { ChevronLeft, ChevronRight, Utensils } from 'lucide-react'
import type { MealHistoryData, WeeklyMealsData } from '../../services/types/meal'
import { formatMealDateKey, getLocalDateKey } from './meal.utils'

interface MealCalendarProps {
  value: string
  week?: WeeklyMealsData
  history?: MealHistoryData
  onChange: (date: string) => void
}

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

const parseKey = (key: string) => new Date(`${key}T00:00:00`)

export function MealCalendar({ value, week, history, onChange }: MealCalendarProps) {
  const todayKey = getLocalDateKey()
  const selected = parseKey(value)
  const [year, month] = [selected.getFullYear(), selected.getMonth()]
  const monthStart = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leading = monthStart.getDay()
  const cells: Array<number | null> = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]

  while (cells.length % 7 !== 0) cells.push(null)

  const loggedDates = new Set([
    ...(week?.daily ?? []).filter((day) => day.meals_logged > 0).map((day) => day.date),
    ...(history?.daily ?? []).filter((day) => day.meals_logged > 0).map((day) => day.date),
  ])

  const currentMonth = monthKey(new Date())
  const nextMonth = new Date(year, month + 1, 1)
  const canGoNext = monthKey(nextMonth) <= currentMonth

  const shiftMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1)
    if (delta > 0 && monthKey(next) > currentMonth) return
    const nextDay = Math.min(
      selected.getDate(),
      new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate(),
    )
    const nextKey = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`
    onChange(nextKey > todayKey ? todayKey : nextKey)
  }

  return (
    <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(56,50,63,0.045)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#7482A4]">
            Nutrition calendar
          </p>
          <h2 className="mt-1 text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
            {monthStart.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#F5F3F6] text-[#5F5A64] transition hover:bg-[#ECEAF0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            disabled={!canGoNext}
            aria-label="Next month"
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#F5F3F6] text-[#5F5A64] transition hover:bg-[#ECEAF0] disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-y-1 text-center">
        {WEEK_DAYS.map((day) => (
          <span key={day} className="pb-2 text-[10px] font-extrabold uppercase tracking-wide text-[#A09BA5]">
            {day}
          </span>
        ))}

        {cells.map((day, index) => {
          if (day === null) return <span key={`empty-${index}`} className="aspect-square" />

          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isToday = iso === todayKey
          const isSelected = iso === value
          const hasMeals = loggedDates.has(iso)
          const isFuture = iso > todayKey

          return (
            <button
              key={iso}
              type="button"
              disabled={isFuture}
              onClick={() => onChange(iso)}
              aria-label={`${formatMealDateKey(iso)}${hasMeals ? ', meals logged' : ''}${isSelected ? ', selected' : ''}`}
              className="group relative grid aspect-square place-items-center rounded-xl disabled:cursor-not-allowed"
            >
              <span
                className={[
                  'grid h-8 w-8 place-items-center rounded-xl text-xs font-bold transition',
                  isSelected
                    ? 'bg-[#7482A4] text-white shadow-[0_5px_14px_rgba(116,130,164,0.22)]'
                    : isToday
                      ? 'bg-[#7482A4]/10 text-[#7482A4]'
                      : 'text-[#5F5A64] group-hover:bg-[#F5F3F6]',
                  isFuture ? 'opacity-25' : '',
                ].join(' ')}
              >
                {day}
              </span>
              {hasMeals && !isSelected && (
                <span className="absolute bottom-0.5 h-1.5 w-1.5 rounded-full bg-[#7482A4]" aria-hidden="true" />
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#7482A4]/10 pt-3 text-[10px] font-semibold text-[#8B8690]">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7482A4]" />
          Meals logged
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Utensils className="h-3.5 w-3.5 text-[#7482A4]" />
          {value === todayKey ? 'Today' : formatMealDateKey(value)}
        </span>
      </div>
    </section>
  )
}
