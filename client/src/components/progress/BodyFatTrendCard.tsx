import { Droplet } from 'lucide-react'

import type { BodyFatTrendPoint } from '../../services/types/progress'
import { ProgressEmptyState } from './ProgressEmptyState'
import {
  type ProgressChartPoint,
  ProgressLineChart,
} from './ProgressLineChart'
import { sortBodyFatTrend } from './progress.utils'

interface BodyFatTrendCardProps {
  points: BodyFatTrendPoint[]
  trendDays: number
  onLogCheckIn: () => void
}

export function BodyFatTrendCard({
  points,
  trendDays,
  onLogCheckIn,
}: BodyFatTrendCardProps) {
  const sorted = sortBodyFatTrend(points)
  const chartPoints: ProgressChartPoint[] = sorted.map((point) => ({
    id: point.id,
    value: point.body_fat_percentage,
    logged_at: point.logged_at,
  }))

  return (
    <section className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Droplet className="h-5 w-5 text-[#7482A4]" />
          <h2 className="text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
            Body Fat Trend
          </h2>
        </div>

        <span className="rounded-full bg-[#7482A4]/10 px-3 py-1 text-[10px] font-extrabold text-[#5E6C8C]">
          Last {trendDays} Days
        </span>
      </div>

      <div className="mt-4">
        {chartPoints.length === 0 ? (
          <ProgressEmptyState
            title="No body-fat trend yet"
            description="Add body-fat data to a check-in to start tracking this trend."
            icon={Droplet}
            actionLabel="Log Check-In"
            onAction={onLogCheckIn}
            compact
          />
        ) : (
          <>
            <ProgressLineChart
              points={chartPoints}
              valueSuffix="%"
              accessibleLabel="Body-fat percentage trend over time"
            />

            {chartPoints.length === 1 ? (
              <p className="mt-2 text-center text-xs font-medium text-[#817C86]">
                Add another body-fat check-in to see your trend.
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}
