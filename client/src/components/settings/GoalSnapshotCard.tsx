import {
  ArrowRight,
  Target,
} from 'lucide-react'

import type { SettingsData } from '../../services/types/settings'
import {
  formatCalories,
  formatGoalLabel,
  formatGrams,
  formatWeight,
} from './settings.utils'

interface GoalSnapshotCardProps {
  settings: SettingsData
  onEdit: () => void
}

function SnapshotRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#7482A4]/[0.08] py-2.5 last:border-0">
      <span className="text-[11px] font-semibold text-[#817C86]">
        {label}
      </span>
      <span className="text-right text-xs font-extrabold text-[#38323F]">
        {value}
      </span>
    </div>
  )
}

export function GoalSnapshotCard({
  settings,
  onEdit,
}: GoalSnapshotCardProps) {
  return (
    <section className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-[#7482A4]" />
          <h2 className="text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
            Goal Snapshot
          </h2>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-extrabold text-[#7482A4] transition hover:bg-[#7482A4]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
        >
          Edit
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4">
        <SnapshotRow
          label="Primary Goal"
          value={formatGoalLabel(
            settings.goals.primary_goal,
          )}
        />
        <SnapshotRow
          label="Current Weight"
          value={formatWeight(
            settings.profile
              .current_weight_kg,
          )}
        />
        <SnapshotRow
          label="Target Weight"
          value={formatWeight(
            settings.goals
              .target_weight_kg,
          )}
        />
        <SnapshotRow
          label="Daily Calories"
          value={formatCalories(
            settings.goals
              .daily_calories,
          )}
        />
        <SnapshotRow
          label="Protein"
          value={formatGrams(
            settings.goals
              .protein_grams,
          )}
        />
        <SnapshotRow
          label="Carbs"
          value={formatGrams(
            settings.goals.carbs_grams,
          )}
        />
        <SnapshotRow
          label="Fat"
          value={formatGrams(
            settings.goals.fat_grams,
          )}
        />
      </div>
    </section>
  )
}
