import { Scale } from 'lucide-react'

import type { WeightTrendPoint } from '../../services/types/progress'
import { ProgressEmptyState } from './ProgressEmptyState'
import {
  type ProgressChartPoint,
  ProgressLineChart,
} from './ProgressLineChart'
import { sortWeightTrend } from './progress.utils'

interface WeightTrendCardProps {
  points: WeightTrendPoint[]
  trendDays: number
  onLogCheckIn: () => void
}

export function WeightTrendCard({
  points,
  trendDays,
  onLogCheckIn,
}: WeightTrendCardProps) {
  const sorted = sortWeightTrend(points)
  const chartPoints: ProgressChartPoint[] = sorted.map((point) => ({
    id: point.id,
    value: point.weight_kg,
    logged_at: point.logged_at,
  }))

  return (
    <section className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-[#7482A4]" />
          <h2 className="text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
            Weight Trend
          </h2>
        </div>

        <span className="rounded-full bg-[#7482A4]/10 px-3 py-1 text-[10px] font-extrabold text-[#5E6C8C]">
          Last {trendDays} Days
        </span>
      </div>

      <div className="mt-4">
        {chartPoints.length === 0 ? (
          <ProgressEmptyState
            title="No weight trend yet"
            description="Log your first weight check-in to start the chart."
            icon={Scale}
            actionLabel="Log Check-In"
            onAction={onLogCheckIn}
            compact
          />
        ) : (
          <>
            <ProgressLineChart
              points={chartPoints}
              valueSuffix=" kg"
              accessibleLabel="Weight trend over time"
            />

            {chartPoints.length === 1 ? (
              <p className="mt-2 text-center text-xs font-medium text-[#817C86]">
                Add another check-in to see your trend.
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}
