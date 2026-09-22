import {
  Activity,
  CalendarDays,
  Droplet,
  Dumbbell,
  Flame,
  Flag,
  Info,
  Scale,
  Target,
  Wheat,
} from 'lucide-react'

import type {
  CoachContextData,
  CoachWorkoutStatus,
} from '../../services/types/coach'

interface CoachContextCardProps {
  context: CoachContextData
}

const formatNumber = (value: number) => {
  const rounded = Math.round(value * 10) / 10
  return rounded.toLocaleString()
}

const formatWeight = (value: number | null) =>
  value === null ? 'Not set' : `${formatNumber(value)} kg`

const statusStyles: Record<
  CoachWorkoutStatus,
  string
> = {
  no_split: 'bg-[#8B8690]/10 text-[#6F6A74]',
  not_scheduled: 'bg-[#8B8690]/10 text-[#6F6A74]',
  rest_day: 'bg-[#7482A4]/10 text-[#5E6C8C]',
  not_started: 'bg-[#C6A45D]/15 text-[#94773D]',
  in_progress: 'bg-[#7482A4]/12 text-[#5E6C8C]',
  completed: 'bg-[#6F9B83]/12 text-[#5A806C]',
}

function ContextRow({
  icon: Icon,
  label,
  value,
  valueClassName = '',
}: {
  icon: typeof Target
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 py-2">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#7482A4]/10 text-[#7482A4]">
        <Icon className="h-4 w-4" />
      </div>
      <span className="min-w-0 flex-1 text-xs font-semibold text-[#5F5A64]">
        {label}
      </span>
      <span
        className={`max-w-[50%] text-right text-xs font-extrabold text-[#38323F] ${valueClassName}`}
      >
        {value}
      </span>
    </div>
  )
}

export function CoachContextCard({
  context,
}: CoachContextCardProps) {
  const { goals, nutrition, workout } = context

  const todayPlan = workout.today.is_rest_day
    ? 'Rest day'
    : workout.today.routine_name ||
      (workout.today.scheduled
        ? 'No routine assigned'
        : 'Not scheduled')

  return (
    <section className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
          Today&apos;s Coach Context
        </h2>
        <button
          type="button"
          aria-label="About coach context"
          title="Live context from your FitPilot profile, meals, and workout plan."
          className="grid h-8 w-8 place-items-center rounded-xl text-[#7482A4] transition hover:bg-[#7482A4]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3">
        <ContextRow
          icon={Target}
          label="Goal"
          value={goals.primary_goal_label}
        />
        <ContextRow
          icon={Scale}
          label="Current Weight"
          value={formatWeight(goals.current_weight_kg)}
        />
        <ContextRow
          icon={Flag}
          label="Target Weight"
          value={formatWeight(goals.target_weight_kg)}
        />

        <div className="my-2 border-t border-[#7482A4]/10" />

        <ContextRow
          icon={Flame}
          label="Calories"
          value={
            nutrition.calories.target > 0
              ? `${formatNumber(nutrition.calories.consumed)} / ${formatNumber(nutrition.calories.target)} kcal`
              : `${formatNumber(nutrition.calories.consumed)} kcal`
          }
        />
        <ContextRow
          icon={Dumbbell}
          label="Protein"
          value={
            nutrition.protein.target > 0
              ? `${formatNumber(nutrition.protein.consumed)} / ${formatNumber(nutrition.protein.target)}g`
              : `${formatNumber(nutrition.protein.consumed)}g`
          }
        />
        <ContextRow
          icon={Wheat}
          label="Carbs"
          value={
            nutrition.carbs.target > 0
              ? `${formatNumber(nutrition.carbs.consumed)} / ${formatNumber(nutrition.carbs.target)}g`
              : `${formatNumber(nutrition.carbs.consumed)}g`
          }
        />
        <ContextRow
          icon={Droplet}
          label="Fat"
          value={
            nutrition.fat.target > 0
              ? `${formatNumber(nutrition.fat.consumed)} / ${formatNumber(nutrition.fat.target)}g`
              : `${formatNumber(nutrition.fat.consumed)}g`
          }
        />

        <div className="my-2 border-t border-[#7482A4]/10" />

        <ContextRow
          icon={CalendarDays}
          label="Workout Split"
          value={workout.split?.name || 'No active split'}
        />
        <ContextRow
          icon={Activity}
          label={`Today's Plan`}
          value={todayPlan}
        />

        <div className="flex min-w-0 items-center gap-3 py-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#7482A4]/10 text-[#7482A4]">
            <Dumbbell className="h-4 w-4" />
          </div>
          <span className="min-w-0 flex-1 text-xs font-semibold text-[#5F5A64]">
            Workout Status
          </span>
          <span
            className={`max-w-[55%] rounded-full px-2.5 py-1 text-right text-[10px] font-extrabold ${
              statusStyles[workout.status]
            }`}
          >
            {workout.label}
          </span>
        </div>
      </div>
    </section>
  )
}
