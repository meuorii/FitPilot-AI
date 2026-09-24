import { Droplet, Dumbbell, Flame, Wheat } from 'lucide-react'

import type { MealNutritionView } from './meal.utils'
import { formatMacroNumber } from './meal.utils'

interface NutritionSummaryProps {
  nutrition: MealNutritionView
  mealsCount: number
  dateLabel?: string
}

const configs = [
  { key: 'calories', icon: Flame },
  { key: 'protein', icon: Dumbbell },
  { key: 'carbs', icon: Wheat },
  { key: 'fat', icon: Droplet },
] as const

export function NutritionSummary({
  nutrition,
  mealsCount,
  dateLabel = 'Today',
}: NutritionSummaryProps) {
  return (
    <section className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold tracking-[-0.02em] text-[#38323F]">
          {dateLabel === 'Today' ? "Today's Nutrition Summary" : `${dateLabel} Nutrition Summary`}
        </h2>
        <span className="text-xs font-semibold text-[#7482A4]">
          {mealsCount} meal{mealsCount === 1 ? '' : 's'} logged on {dateLabel.toLowerCase()}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {configs.map(({ key, icon: Icon }) => {
          const metric = nutrition[key]
          const amount =
            metric.unit === 'kcal'
              ? `${Math.round(metric.consumed).toLocaleString()} kcal`
              : `${formatMacroNumber(metric.consumed)}g`

          return (
            <div
              key={key}
              className="rounded-2xl border border-[#7482A4]/12 bg-[#FCFBFD] p-4"
            >
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#7482A4]/10 text-[#7482A4]">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#8B8690]">
                    {metric.label}
                  </p>
                  <p className="text-lg font-extrabold text-[#38323F]">
                    {amount}
                  </p>
                </div>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EAE8EE]">
                <div
                  className="h-full rounded-full bg-[#7482A4] transition-[width]"
                  style={{ width: `${metric.percentage}%` }}
                />
              </div>

              <p className="mt-2 text-[10px] text-[#8B8690]">
                {metric.target > 0
                  ? `${metric.percentage}% of ${formatMacroNumber(metric.target)}${metric.unit === 'kcal' ? ' kcal' : 'g'}`
                  : 'Goal unavailable'}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

