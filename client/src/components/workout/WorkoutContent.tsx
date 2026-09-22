import type {
  WorkoutExercise,
  WorkoutHistoryItem,
  WorkoutOverviewData,
  WorkoutRoutineExercise,
  WorkoutSplit,
} from '../../services/types/workout'
import { QuickSessionPreview } from './QuickSessionPreview'
import { RecentWorkouts } from './RecentWorkouts'
import { TodayExerciseList } from './TodayExerciseList'
import { WorkoutHero } from './WorkoutHero'
import { WorkoutMotivationCard } from './WorkoutMotivationCard'
import { WorkoutSplitCard } from './WorkoutSplitCard'
import { chooseDisplayRoutine } from './workoutExercise.utils'

interface WorkoutContentProps {
  overview: WorkoutOverviewData
  activeSplit: WorkoutSplit | null
  exerciseLibrary: WorkoutExercise[]
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
  onSelectExercise: (
    exercise: WorkoutRoutineExercise,
  ) => void
}

export function WorkoutContent({
  overview,
  activeSplit,
  exerciseLibrary,
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
  const splitDayRoutine =
    activeSplit?.days.find(
      (day) =>
        day.day_of_week ===
        overview.day_of_week,
    )?.routine ?? null

  /*
   * Prefer the active session routine because it is the
   * actual workout the user is performing. If it is not
   * available, use today's resolved routine and finally
   * the matching routine embedded in the active split.
   *
   * chooseDisplayRoutine() prefers a candidate that
   * actually contains routine_exercises.
   */
  const displayRoutine =
    chooseDisplayRoutine([
      overview.active_session
        ?.routine,
      overview.today.routine,
      splitDayRoutine,
    ])

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.72fr)_minmax(330px,1fr)]">
      <WorkoutHero
        routine={displayRoutine}
        activeSession={
          overview.active_session
        }
        isRestDay={
          overview.today.is_rest_day
        }
        hasSplits={splitsCount > 0}
        hasRoutines={
          routinesCount > 0
        }
        isStarting={isStarting}
        onStart={onStartWorkout}
        onOpenActive={
          onOpenActiveWorkout
        }
        onManageSplit={
          splitsCount > 0
            ? onChangeSplit
            : onCreateSplit
        }
        onCreateRoutine={
          onCreateRoutine
        }
      />

      <WorkoutSplitCard
        split={activeSplit}
        todayDayOfWeek={
          overview.day_of_week
        }
        routinesCount={
          routinesCount
        }
        onChangeSplit={
          onChangeSplit
        }
        onCreateSplit={
          onCreateSplit
        }
        onCreateRoutine={
          onCreateRoutine
        }
      />

      <TodayExerciseList
        routine={displayRoutine}
        exerciseLibrary={
          exerciseLibrary
        }
        search={search}
        onSelectExercise={
          onSelectExercise
        }
      />

      <QuickSessionPreview
        session={
          overview.active_session
        }
        exerciseLibrary={
          exerciseLibrary
        }
        onOpenFullScreen={
          onOpenActiveWorkout
        }
      />

      <RecentWorkouts
        workouts={history}
        search={search}
      />

      <WorkoutMotivationCard />
    </div>
  )
}
