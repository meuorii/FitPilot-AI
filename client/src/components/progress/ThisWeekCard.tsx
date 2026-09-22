import {
  CalendarCheck2,
  Dumbbell,
  Gauge,
  Trophy,
} from 'lucide-react'

import type {
  ProgressOverviewMeta,
  ProgressTrainingSummary,
} from '../../services/types/progress'
import {
  formatVolume,
  formatWeekRange,
  safePercentage,
} from './progress.utils'

interface ThisWeekCardProps {
  training: ProgressTrainingSummary
  meta: ProgressOverviewMeta
}

export function ThisWeekCard({
  training,
  meta,
}: ThisWeekCardProps) {
  const percentage = safePercentage(
    training.workouts_this_week,
    training.workout_days_goal,
  )
  const visualPercentage = percentage ?? 0

  return (
    <section className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
      <div className="flex items-center gap-2">
        <CalendarCheck2 className="h-5 w-5 text-[#7482A4]" />
        <h2 className="text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
          This Week
        </h2>
      </div>

      <p className="mt-1 text-[11px] font-semibold text-[#918B95]">
        {formatWeekRange(meta.week_start, meta.today)}
      </p>

      <div className="mt-5 rounded-2xl bg-[#7482A4]/[0.06] p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#918B95]">
              Workouts This Week
            </p>
            <p className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-[#38323F]">
              {training.workouts_this_week}
              <span className="text-sm text-[#8B8690]">
                {' '}
                / {training.workout_days_goal > 0
                  ? training.workout_days_goal
                  : '—'}
              </span>
            </p>
          </div>

          <p className="text-sm font-extrabold text-[#7482A4]">
            {percentage === null
              ? 'Goal unavailable'
              : `${Math.round(percentage)}%`}
          </p>
        </div>

        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-[#7482A4]/12"
          aria-label={
            percentage === null
              ? 'Weekly workout goal unavailable'
              : `${Math.round(percentage)} percent of weekly workout goal`
          }
        >
          <div
            className="h-full rounded-full bg-[#7482A4] transition-[width]"
            style={{ width: `${visualPercentage}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <div className="flex items-center gap-3 rounded-2xl border border-[#7482A4]/10 p-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#7482A4]/10 text-[#7482A4]">
            <Dumbbell className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#918B95]">
              Total Volume
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-[#38323F]">
              {formatVolume(training.total_volume_kg)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[#7482A4]/10 p-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#7482A4]/10 text-[#7482A4]">
            <Gauge className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#918B95]">
              Workout Days Goal
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-[#38323F]">
              {training.workout_days_goal > 0
                ? `${training.workout_days_goal} days`
                : 'Not set'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[#7482A4]/10 p-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#7482A4]/10 text-[#7482A4]">
            <Trophy className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#918B95]">
              Completed Workouts
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-[#38323F]">
              {training.completed_workouts}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
