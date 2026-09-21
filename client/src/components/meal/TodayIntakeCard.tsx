import type { ReactNode } from 'react'
import { Droplet, Dumbbell, Flame, Wheat } from 'lucide-react'

import type { MealNutritionView } from './meal.utils'
import { formatMacroNumber } from './meal.utils'

interface TodayIntakeCardProps {
  nutrition: MealNutritionView
  mealsCount: number
  dateLabel: string
}

const configs = [
  { key: 'calories', icon: Flame },
  { key: 'protein', icon: Dumbbell },
  { key: 'carbs', icon: Wheat },
  { key: 'fat', icon: Droplet },
] as const

function ProgressRing({
  percentage,
  children,
}: {
  percentage: number
  children: ReactNode
}) {
  return (
    <div
      className="relative grid h-[78px] w-[78px] place-items-center rounded-full"
      style={{
        background: `conic-gradient(#7482A4 ${percentage * 3.6}deg, #ECEAF0 0deg)`,
      }}
      aria-label={`${percentage}% of goal`}
    >
      <div className="grid h-[64px] w-[64px] place-items-center rounded-full bg-white text-center">
        {children}
      </div>
    </div>
  )
}

export function TodayIntakeCard({
  nutrition,
  mealsCount,
  dateLabel,
}: TodayIntakeCardProps) {
  return (
    <section className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold tracking-[-0.02em] text-[#38323F]">
          Today&apos;s Intake
        </h2>
        <span className="text-[11px] font-semibold text-[#7482A4]">
          {dateLabel}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
        {configs.map(({ key, icon: Icon }) => {
          const metric = nutrition[key]
          const display =
            metric.unit === 'kcal'
              ? Math.round(metric.consumed).toLocaleString()
              : `${formatMacroNumber(metric.consumed)}g`

          return (
            <div key={key} className="flex flex-col items-center text-center">
              <ProgressRing percentage={metric.percentage}>
                <div>
                  <Icon className="mx-auto h-4 w-4 text-[#7482A4]" />
                  <p className="mt-0.5 text-xs font-extrabold text-[#38323F]">
                    {display}
                  </p>
                  {metric.unit === 'kcal' ? (
                    <p className="text-[9px] font-bold text-[#8B8690]">kcal</p>
                  ) : null}
                </div>
              </ProgressRing>

              <p className="mt-2 text-[10px] leading-4 text-[#8B8690]">
                {metric.target > 0
                  ? `${metric.percentage}% of ${formatMacroNumber(metric.target)}${metric.unit === 'kcal' ? ' kcal' : 'g'} goal`
                  : 'Goal unavailable'}
              </p>
            </div>
          )
        })}
      </div>

      <div className="mt-5 flex items-center gap-3 border-t border-[#7482A4]/10 pt-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#7482A4]/10 text-[#7482A4]">
          <span className="text-lg" aria-hidden="true">🍴</span>
        </div>
        <div>
          <p className="text-sm font-extrabold text-[#38323F]">
            {mealsCount > 0
              ? `${mealsCount} meal${mealsCount === 1 ? '' : 's'} logged today`
              : 'No meals logged yet'}
          </p>
          <p className="mt-0.5 text-xs text-[#8B8690]">
            {mealsCount > 0
              ? 'Keep it up! Your daily totals are tracking.'
              : 'Start by parsing or logging your first meal.'}
          </p>
        </div>
      </div>
    </section>
  )
}
