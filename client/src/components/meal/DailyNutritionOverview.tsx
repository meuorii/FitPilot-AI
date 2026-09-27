import { Flame, Beef, Wheat, Droplets } from 'lucide-react'
import type { MealNutritionView } from './meal.utils'
import { formatMacroNumber } from './meal.utils'

interface DailyNutritionOverviewProps {
  nutrition: MealNutritionView
  mealsCount: number
  dateLabel: string
  isToday: boolean
}

const metrics = [
  { key: 'protein' as const, icon: Beef, label: 'Protein' },
  { key: 'carbs' as const, icon: Wheat, label: 'Carbs' },
  { key: 'fat' as const, icon: Droplets, label: 'Fat' },
]

export function DailyNutritionOverview({
  nutrition,
  mealsCount,
  dateLabel,
  isToday,
}: DailyNutritionOverviewProps) {
  const calorie = nutrition.calories
  const remaining = Math.max(0, calorie.target - calorie.consumed)

  return (
    <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(56,50,63,0.045)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#7482A4]">
            {isToday ? "Today's intake" : 'Selected day'}
          </p>
          <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-[#38323F]">
            {dateLabel}
          </h2>
        </div>
        <span className="rounded-full bg-[#7482A4]/10 px-3 py-1.5 text-[10px] font-extrabold text-[#7482A4]">
          {mealsCount} meal{mealsCount === 1 ? '' : 's'} logged
        </span>
      </div>

      <div className="mt-6 rounded-2xl bg-[#F7F6F8] p-4 sm:p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold text-[#8B8690]">Calories</p>
            <p className="mt-1 text-3xl font-extrabold tracking-[-0.04em] text-[#38323F]">
              {Math.round(calorie.consumed).toLocaleString()}
              <span className="ml-1 text-sm font-bold text-[#8B8690]">
                / {Math.round(calorie.target).toLocaleString()} kcal
              </span>
            </p>
          </div>
          <p className="text-right text-[11px] font-bold text-[#7482A4]">
            {remaining.toLocaleString()} kcal
            <br />
            remaining
          </p>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E5E3E8]">
          <div
            className="h-full rounded-full bg-[#7482A4] transition-[width] duration-500"
            style={{ width: `${calorie.percentage}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {metrics.map(({ key, icon: Icon, label }) => {
          const metric = nutrition[key]
          const remainingMacro = Math.max(0, metric.target - metric.consumed)
          return (
            <div key={key} className="rounded-2xl bg-[#FCFBFD] p-3.5">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#7482A4]/10 text-[#7482A4]">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-[#8B8690]">{label}</p>
                  <p className="text-sm font-extrabold text-[#38323F]">
                    {formatMacroNumber(metric.consumed)}g
                    <span className="font-semibold text-[#A19CA5]">
                      {' '}/ {formatMacroNumber(metric.target)}g
                    </span>
                  </p>
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E8E6EB]">
                <div className="h-full rounded-full bg-[#7482A4]" style={{ width: `${metric.percentage}%` }} />
              </div>
              <p className="mt-2 text-[10px] font-semibold text-[#8B8690]">
                {formatMacroNumber(remainingMacro)}g remaining
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
