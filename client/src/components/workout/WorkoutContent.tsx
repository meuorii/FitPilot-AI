import type {
  WorkoutHistoryItem,
  WorkoutOverviewData,
  WorkoutSplit,
  WorkoutRoutineExercise,
} from '../../services/types/workout'
import { QuickSessionPreview } from './QuickSessionPreview'
import { RecentWorkouts } from './RecentWorkouts'
import { TodayExerciseList } from './TodayExerciseList'
import { WorkoutHero } from './WorkoutHero'
import { WorkoutMotivationCard } from './WorkoutMotivationCard'
import { WorkoutSplitCard } from './WorkoutSplitCard'

interface WorkoutContentProps {
  overview: WorkoutOverviewData
  activeSplit: WorkoutSplit | null
  splitsCount: number
  routinesCount: number
  history: WorkoutHistoryItem[]
  search: string
  isStarting: boolean
  onStartWorkout: () => void
  onOpenActiveWorkout: () => void
  onChangeSplit: () => void
  onCreateSplit: () => void
  onCreateRoutine: () => void
  onSelectExercise: (exercise: WorkoutRoutineExercise) => void
}

export function WorkoutContent({
  overview,
  activeSplit,
  splitsCount,
  routinesCount,
  history,
  search,
  isStarting,
  onStartWorkout,
  onOpenActiveWorkout,
  onChangeSplit,
  onCreateSplit,
  onCreateRoutine,
  onSelectExercise,
}: WorkoutContentProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.72fr)_minmax(330px,1fr)]">
      <WorkoutHero
        routine={overview.today.routine}
        activeSession={overview.active_session}
        isRestDay={overview.today.is_rest_day}
        hasSplits={splitsCount > 0}
        hasRoutines={routinesCount > 0}
        isStarting={isStarting}
        onStart={onStartWorkout}
        onOpenActive={onOpenActiveWorkout}
        onManageSplit={splitsCount > 0 ? onChangeSplit : onCreateSplit}
        onCreateRoutine={onCreateRoutine}
      />

      <WorkoutSplitCard
        split={activeSplit}
        todayDayOfWeek={overview.day_of_week}
        routinesCount={routinesCount}
        onChangeSplit={onChangeSplit}
        onCreateSplit={onCreateSplit}
        onCreateRoutine={onCreateRoutine}
      />

      <TodayExerciseList
        routine={overview.today.routine}
        search={search}
        onSelectExercise={onSelectExercise}
      />

      <QuickSessionPreview
        session={overview.active_session}
        onOpenFullScreen={onOpenActiveWorkout}
      />

      <RecentWorkouts workouts={history} search={search} />
      <WorkoutMotivationCard />
    </div>
  )
}
