import { CalendarDays, ChevronLeft, ChevronRight, History } from 'lucide-react'

import {
  formatMealDateKey,
  getLocalDateKey,
  shiftDateKey,
} from './meal.utils'

interface MealDateNavigatorProps {
  value: string
  onChange: (date: string) => void
  onViewHistory: () => void
}

export function MealDateNavigator({
  value,
  onChange,
  onViewHistory,
}: MealDateNavigatorProps) {
  const today = getLocalDateKey()
  const isToday = value === today
  const canGoForward = value < today

  return (
    <section className="mb-5 rounded-[24px] border border-[#7482A4]/12 bg-white p-4 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(shiftDateKey(value, -1))}
            aria-label="View previous day"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#7482A4]/15 bg-[#F8F7FA] text-[#5F5A64] transition hover:bg-[#F0EEF3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#7482A4]">
              Meal day
            </p>
            <p className="truncate text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
              {isToday ? 'Today' : formatMealDateKey(value)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onChange(shiftDateKey(value, 1))}
            disabled={!canGoForward}
            aria-label="View next day"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#7482A4]/15 bg-[#F8F7FA] text-[#5F5A64] transition hover:bg-[#F0EEF3] disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <label className="relative ml-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#7482A4]/15 bg-[#F8F7FA] text-[#5F5A64] transition hover:bg-[#F0EEF3] focus-within:ring-2 focus-within:ring-[#7482A4]/15">
            <span className="sr-only">Choose meal date</span>
            <CalendarDays className="h-4 w-4" />
            <input
              type="date"
              value={value}
              max={today}
              onChange={(event) => onChange(event.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Choose meal date"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
          {!isToday ? (
            <button
              type="button"
              onClick={() => onChange(today)}
              className="rounded-xl bg-[#7482A4] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#657493] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
            >
              Back to Today
            </button>
          ) : null}

          <button
            type="button"
            onClick={onViewHistory}
            className="inline-flex items-center gap-2 rounded-xl border border-[#7482A4]/15 bg-white px-4 py-2.5 text-xs font-extrabold text-[#5F5A64] transition hover:bg-[#F5F3F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            <History className="h-4 w-4 text-[#7482A4]" />
            Week &amp; History
          </button>
        </div>
      </div>
    </section>
  )
}
