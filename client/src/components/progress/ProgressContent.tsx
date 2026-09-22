import type {
  CreateProgressLogInput,
  ProgressLog,
  ProgressOverviewData,
} from '../../services/types/progress'
import { BodyFatTrendCard } from './BodyFatTrendCard'
import { GoalProgressCard } from './GoalProgressCard'
import { LatestCheckInCard } from './LatestCheckInCard'
import { MilestonesInsights } from './MilestonesInsights'
import { ProgressErrorState } from './ProgressErrorState'
import { ProgressHero } from './ProgressHero'
import { QuickCheckInCard } from './QuickCheckInCard'
import { RecentCheckIns } from './RecentCheckIns'
import { ThisWeekCard } from './ThisWeekCard'
import { WeightTrendCard } from './WeightTrendCard'

interface ProgressContentProps {
  overview?: ProgressOverviewData
  overviewError: string | null
  isOverviewRetrying: boolean
  recentLogs: ProgressLog[]
  recentTotal: number
  recentLogsError: boolean
  search: string
  isCreating: boolean
  onCreate: (input: CreateProgressLogInput) => Promise<void>
  onRetryOverview: () => void
  onRetryLogs: () => void
  onDelete: (log: ProgressLog) => void
  onViewAll: () => void
  onLogCheckIn: () => void
}

export function ProgressContent({
  overview,
  overviewError,
  isOverviewRetrying,
  recentLogs,
  recentTotal,
  recentLogsError,
  search,
  isCreating,
  onCreate,
  onRetryOverview,
  onRetryLogs,
  onDelete,
  onViewAll,
  onLogCheckIn,
}: ProgressContentProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 2xl:grid-cols-[minmax(0,2.15fr)_minmax(300px,0.85fr)]">
        {overview ? (
          <ProgressHero
            goal={overview.goal}
            onLogCheckIn={onLogCheckIn}
          />
        ) : (
          <ProgressErrorState
            title="Progress overview unavailable"
            description={
              overviewError ||
              'Your check-in form is still available. Retry to restore goal, trend, and training summaries.'
            }
            isRetrying={isOverviewRetrying}
            onRetry={onRetryOverview}
          />
        )}

        <QuickCheckInCard
          isSubmitting={isCreating}
          onSubmit={onCreate}
        />
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,2.15fr)_minmax(300px,0.85fr)]">
        <div className="min-w-0 space-y-5">
          {overview ? (
            <>
              <div className="grid min-w-0 gap-5 xl:grid-cols-2">
                <GoalProgressCard
                  goal={overview.goal}
                  onLogCheckIn={onLogCheckIn}
                />
                <WeightTrendCard
                  points={overview.weight_trend}
                  trendDays={overview.meta.trend_days}
                  onLogCheckIn={onLogCheckIn}
                />
                <BodyFatTrendCard
                  points={overview.body_fat_trend}
                  trendDays={overview.meta.trend_days}
                  onLogCheckIn={onLogCheckIn}
                />
                <LatestCheckInCard
                  checkIn={overview.latest_check_in}
                  onLogCheckIn={onLogCheckIn}
                />
              </div>
            </>
          ) : null}

          <RecentCheckIns
            logs={recentLogs}
            total={recentTotal}
            isError={recentLogsError}
            search={search}
            onRetry={onRetryLogs}
            onDelete={onDelete}
            onViewAll={onViewAll}
            onLogCheckIn={onLogCheckIn}
          />
        </div>

        {overview ? (
          <aside className="min-w-0 space-y-5">
            <ThisWeekCard
              training={overview.training}
              meta={overview.meta}
            />
            <MilestonesInsights overview={overview} />
          </aside>
        ) : (
          <aside className="min-w-0">
            <ProgressErrorState
              title="Insights unavailable"
              description="Goal, workout, and milestone insights will return when the overview request succeeds."
              isRetrying={isOverviewRetrying}
              onRetry={onRetryOverview}
            />
          </aside>
        )}
      </div>
    </div>
  )
}
