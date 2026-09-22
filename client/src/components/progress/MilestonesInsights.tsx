import {
  Activity,
  Dumbbell,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

import type { ProgressOverviewData } from '../../services/types/progress'
import {
  formatBodyFat,
  formatWeight,
  sortBodyFatTrend,
} from './progress.utils'
import { ProgressEmptyState } from './ProgressEmptyState'

interface MilestonesInsightsProps {
  overview: ProgressOverviewData
}

interface Insight {
  title: string
  description: string
  icon: typeof Sparkles
}

export function MilestonesInsights({
  overview,
}: MilestonesInsightsProps) {
  const insights: Insight[] = []
  const change = overview.goal.weight_change_kg

  if (typeof change === 'number' && Number.isFinite(change)) {
    insights.push({
      title: 'Weight from starting point',
      description:
        change === 0
          ? 'Your current weight matches your recorded starting weight.'
          : `${formatWeight(Math.abs(change))} ${
              change < 0 ? 'below' : 'above'
            } your starting weight.`,
      icon: change < 0 ? TrendingDown : TrendingUp,
    })
  }

  const bodyFat = sortBodyFatTrend(overview.body_fat_trend)

  if (bodyFat.length >= 2) {
    const first = bodyFat[0].body_fat_percentage
    const latest = bodyFat[bodyFat.length - 1].body_fat_percentage
    const difference = latest - first

    insights.push({
      title: 'Body-fat change',
      description:
        difference === 0
          ? 'Your earliest and latest tracked body-fat values are the same.'
          : `Body fat is ${formatBodyFat(
              Math.abs(difference),
            )} ${difference < 0 ? 'lower' : 'higher'} than your earliest tracked value.`,
      icon: difference < 0 ? TrendingDown : TrendingUp,
    })
  }

  if (overview.training.workouts_this_week > 0) {
    insights.push({
      title: 'Weekly training',
      description: `${overview.training.workouts_this_week} workout${
        overview.training.workouts_this_week === 1 ? '' : 's'
      } completed this week.`,
      icon: Dumbbell,
    })
  }

  if (overview.training.completed_workouts > 0) {
    insights.push({
      title: 'Training history',
      description: `${overview.training.completed_workouts} completed workout${
        overview.training.completed_workouts === 1 ? '' : 's'
      } recorded in FitPilot.`,
      icon: Activity,
    })
  }

  return (
    <section className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-[#7482A4]" />
        <h2 className="text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
          Milestones &amp; Insights
        </h2>
      </div>

      {insights.length === 0 ? (
        <ProgressEmptyState
          title="Your milestones will appear here"
          description="Keep logging check-ins and completing workouts to build a meaningful progress history."
          icon={Sparkles}
          compact
        />
      ) : (
        <div className="mt-4 space-y-2">
          {insights.slice(0, 4).map(({ title, description, icon: Icon }) => (
            <article
              key={`${title}-${description}`}
              className="flex gap-3 rounded-2xl border border-[#7482A4]/10 bg-[#FCFBFD] p-3.5"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#7482A4]/10 text-[#7482A4]">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#38323F]">
                  {title}
                </p>
                <p className="mt-1 text-[11px] leading-4 text-[#817C86]">
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
