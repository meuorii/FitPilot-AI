import { Beef, Droplets, Flame, Wheat } from 'lucide-react'
import type { ReactNode } from 'react'
import type { MealNutritionView } from './meal.utils'
import { formatMacroNumber } from './meal.utils'

interface DailyNutritionOverviewProps {
  nutrition: MealNutritionView
  mealsCount: number
  dateLabel: string
  isToday: boolean
}

const metrics = [
  { key: 'protein' as const, icon: Beef, label: 'Protein', tone: 'text-[#7482A4]' },
  { key: 'carbs' as const, icon: Wheat, label: 'Carbs', tone: 'text-[#6F9B83]' },
  { key: 'fat' as const, icon: Droplets, label: 'Fat', tone: 'text-[#B89456]' },
]

interface IntakeRingProps {
  percentage: number
  size?: number
  stroke?: number
  children: ReactNode
  trackClassName?: string
  progressClassName?: string
}

function IntakeRing({
  percentage,
  size = 100,
  stroke = 8,
  children,
  trackClassName = 'text-[#E8EAF2]',
  progressClassName = 'text-[#7482A4]',
}: IntakeRingProps) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const safePercentage = Math.min(100, Math.max(0, Number.isFinite(percentage) ? percentage : 0))
  const offset = circumference * (1 - safePercentage / 100)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className={trackClassName}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${progressClassName} transition-[stroke-dashoffset] duration-700 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  )
}

export function DailyNutritionOverview({
  nutrition,
  mealsCount,
  dateLabel,
  isToday,
}: DailyNutritionOverviewProps) {
  const calorie = nutrition.calories
  const remainingCalories = Math.max(0, calorie.target - calorie.consumed)

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-[#7482A4]/15 bg-white p-4 shadow-[0_10px_30px_rgba(56,50,63,0.055)] sm:p-5">
      <div className="pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full bg-[#7482A4]/[0.07] blur-2xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#7482A4]/10 text-[#7482A4]">
              <Flame className="h-4 w-4" />
            </span>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#7482A4]">
              {isToday ? "Today's intake" : 'Daily intake'}
            </p>
          </div>
          <h2 className="mt-2 text-lg font-extrabold tracking-[-0.03em] text-[#38323F] sm:text-xl">
            {dateLabel}
          </h2>
          <p className="mt-1 text-xs text-[#8B8690]">Your daily fuel, at a glance</p>
        </div>
        <span className="shrink-0 rounded-full border border-[#7482A4]/10 bg-[#F5F3F6] px-2.5 py-1.5 text-[10px] font-bold text-[#5F6E91]">
          {mealsCount} logged
        </span>
      </div>

      <div className="relative mt-5 rounded-[20px] border border-[#7482A4]/10 bg-gradient-to-br from-[#F8F9FD] via-white to-[#F5F3F6] p-4">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-5">
          <IntakeRing percentage={calorie.percentage} size={132} stroke={10}>
            <Flame className="mb-1 h-4 w-4 text-[#7482A4]" />
            <p className="text-[10px] font-bold text-[#8B8690]">CALORIES</p>
            <p className="mt-0.5 text-xl font-extrabold leading-none tracking-[-0.04em] text-[#38323F]">
              {Math.round(calorie.consumed).toLocaleString()}
            </p>
            <p className="mt-1 text-[10px] font-semibold text-[#8B8690]">
              of {Math.round(calorie.target).toLocaleString()} kcal
            </p>
          </IntakeRing>
          <div className="min-w-0 text-center sm:text-left">
            <p className="text-xs font-semibold text-[#8B8690]">Daily calorie goal</p>
            <p className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-[#38323F]">
              {Math.round(calorie.percentage)}<span className="ml-0.5 text-sm text-[#8B8690]">%</span>
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#7482A4]/10 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7482A4]" />
              <span className="text-[11px] font-bold text-[#5F6E91]">
                {remainingCalories.toLocaleString()} kcal left
              </span>
            </div>
            {calorie.consumed > calorie.target ? (
              <p className="mt-2 text-[10px] font-semibold text-[#B96F78]">
                {Math.round(calorie.consumed - calorie.target).toLocaleString()} kcal over goal
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {metrics.map(({ key, icon: Icon, label, tone }) => {
          const metric = nutrition[key]
          const consumed = Math.max(0, metric.consumed)
          const remaining = Math.max(0, metric.target - consumed)

          return (
            <div
              key={key}
              className="flex min-w-0 flex-col items-center rounded-[18px] border border-[#7482A4]/10 bg-white px-1.5 py-3 transition duration-200 hover:-translate-y-0.5 hover:border-[#7482A4]/25 hover:shadow-[0_8px_18px_rgba(56,50,63,0.06)] sm:px-2"
            >
              <IntakeRing
                percentage={metric.percentage}
                size={76}
                stroke={6}
                trackClassName="text-[#ECECF2]"
                progressClassName={tone}
              >
                <Icon className={`mb-0.5 h-3.5 w-3.5 ${tone}`} />
                <p className="text-[12px] font-extrabold leading-none text-[#38323F]">
                  {formatMacroNumber(consumed)}g
                </p>
                <p className="mt-1 text-[9px] font-medium text-[#8B8690]">
                  / {formatMacroNumber(metric.target)}g
                </p>
              </IntakeRing>
              <p className="mt-2 text-[11px] font-extrabold text-[#38323F]">{label}</p>
              <p className="mt-0.5 text-center text-[9px] font-medium leading-4 text-[#8B8690]">
                {formatMacroNumber(remaining)}g left
              </p>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-[#F5F3F6] px-3.5 py-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-[#7482A4] shadow-sm">
          <Flame className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-extrabold text-[#38323F]">
            {mealsCount > 0
              ? `${mealsCount} meal${mealsCount === 1 ? '' : 's'} logged`
              : 'Ready when you are'}
          </p>
          <p className="mt-0.5 text-[10px] leading-4 text-[#8B8690]">
            {mealsCount > 0
              ? 'Your intake rings update as you log meals.'
              : isToday
                ? 'Log your first meal to start filling your rings.'
                : 'No meals logged for this date yet.'}
          </p>
        </div>
      </div>
    </section>
  )
}
