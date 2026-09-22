import {
  Flag,
  Scale,
  Target,
  TrendingUp,
} from 'lucide-react'

import type { ProgressGoalSummary } from '../../services/types/progress'
import {
  formatGoalLabel,
  formatPercentage,
  formatSignedWeight,
  formatWeight,
  hasMeaningfulGoalProgress,
  safePercentage,
} from './progress.utils'
import { ProgressEmptyState } from './ProgressEmptyState'

interface GoalProgressCardProps {
  goal: ProgressGoalSummary
  onLogCheckIn: () => void
}

function ProgressRing({
  value,
}: {
  value: number
}) {
  const radius = 48
  const circumference = 2 * Math.PI * radius
  const visual = safePercentage(value) ?? 0
  const offset =
    circumference - (visual / 100) * circumference

  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg
        viewBox="0 0 120 120"
        className="h-full w-full -rotate-90"
        role="img"
        aria-label={`${formatPercentage(value)} toward goal`}
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(116,130,164,0.12)"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#7482A4"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="text-2xl font-extrabold tracking-[-0.04em] text-[#38323F]">
            {formatPercentage(value)}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8B8690]">
            to goal
          </p>
        </div>
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#9B96A0]">
        {label}
      </p>
      <p className="mt-1 text-sm font-extrabold text-[#38323F]">
        {value}
      </p>
    </div>
  )
}

export function GoalProgressCard({
  goal,
  onLogCheckIn,
}: GoalProgressCardProps) {
  const hasProgress = hasMeaningfulGoalProgress(goal)

  return (
    <section className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-[#7482A4]" />
        <h2 className="text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
          Goal Progress
        </h2>
      </div>

      {!hasProgress ? (
        <>
          <ProgressEmptyState
            title="Start tracking your goal"
            description="Log your first check-in to begin measuring progress."
            icon={TrendingUp}
            actionLabel="Log Check-In"
            onAction={onLogCheckIn}
            compact
          />

          <div className="grid grid-cols-2 gap-4 border-t border-[#7482A4]/10 pt-4">
            <Metric
              label="Primary Goal"
              value={formatGoalLabel(goal.primary_goal)}
            />
            <Metric
              label="Current Weight"
              value={formatWeight(goal.current_weight_kg)}
            />
            <Metric
              label="Target Weight"
              value={formatWeight(goal.target_weight_kg)}
            />
            <Metric
              label="Starting Weight"
              value={formatWeight(goal.starting_weight_kg)}
            />
          </div>
        </>
      ) : (
        <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
          <ProgressRing value={goal.progress_percentage ?? 0} />

          <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-5 gap-y-4">
            <Metric
              label="Primary Goal"
              value={formatGoalLabel(goal.primary_goal)}
            />
            <Metric
              label="Starting Weight"
              value={formatWeight(goal.starting_weight_kg)}
            />
            <Metric
              label="Current Weight"
              value={formatWeight(goal.current_weight_kg)}
            />
            <Metric
              label="Target Weight"
              value={formatWeight(goal.target_weight_kg)}
            />
            <Metric
              label="Weight Change"
              value={formatSignedWeight(goal.weight_change_kg)}
            />
            <Metric
              label="Remaining"
              value={formatWeight(goal.remaining_kg)}
            />
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#7482A4]/[0.06] px-3 py-2.5 text-xs text-[#6C6670]">
        <Scale className="h-4 w-4 shrink-0 text-[#7482A4]" />
        <span>
          Weight changes are shown neutrally and should be interpreted in the context of your selected goal.
        </span>
      </div>
    </section>
  )
}
