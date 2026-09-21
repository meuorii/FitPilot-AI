import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { WorkoutContent } from '../components/workout/WorkoutContent'
import { WorkoutErrorState } from '../components/workout/WorkoutErrorState'
import { WorkoutHeader } from '../components/workout/WorkoutHeader'
import { WorkoutSkeleton } from '../components/workout/WorkoutSkeleton'
import { ActiveWorkoutModal } from '../components/workout/modals/ActiveWorkoutModal'
import { ChangeWorkoutSplitModal } from '../components/workout/modals/ChangeWorkoutSplitModal'
import { CreateWorkoutRoutineModal } from '../components/workout/modals/CreateWorkoutRoutineModal'
import { CreateWorkoutSplitModal } from '../components/workout/modals/CreateWorkoutSplitModal'
import { ExerciseDetailsModal } from '../components/workout/modals/ExerciseDetailsModal'
import {
  useActivateWorkoutSplit,
  useCreateWorkoutRoutine,
  useCreateWorkoutSplit,
  useStartWorkout,
  useWorkoutExercises,
  useWorkoutHistory,
  useWorkoutOverview,
  useWorkoutRoutines,
  useWorkoutSplits,
} from '../hooks/useWorkout'
import type { DashboardLayoutContext } from '../layouts/MainDashboardLayout'
import type {
  CreateWorkoutRoutineInput,
  CreateWorkoutSplitInput,
  WorkoutRoutineExercise,
} from '../services/types/workout'
import { useToastStore } from '../stores/toastStore'

export function WorkoutsPage() {
  const { openSidebar } = useOutletContext<DashboardLayoutContext>()
  const showToast = useToastStore((state) => state.showToast)

  const [search, setSearch] = useState('')
  const [changeSplitOpen, setChangeSplitOpen] = useState(false)
  const [createSplitOpen, setCreateSplitOpen] = useState(false)
  const [createRoutineOpen, setCreateRoutineOpen] = useState(false)
  const [returnToSplitAfterRoutine, setReturnToSplitAfterRoutine] =
    useState(false)
  const [selectedExercise, setSelectedExercise] =
    useState<WorkoutRoutineExercise | null>(null)
  const [activeWorkoutOpen, setActiveWorkoutOpen] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  const overviewQuery = useWorkoutOverview()
  const exercisesQuery = useWorkoutExercises()
  const splitsQuery = useWorkoutSplits()
  const routinesQuery = useWorkoutRoutines()
  const historyQuery = useWorkoutHistory({
    status: 'completed',
    limit: 10,
    offset: 0,
  })

  const startWorkoutMutation = useStartWorkout()
  const activateSplitMutation = useActivateWorkoutSplit()
  const createRoutineMutation = useCreateWorkoutRoutine()
  const createSplitMutation = useCreateWorkoutSplit()

  const overview = overviewQuery.data?.data
  const exercises = exercisesQuery.data?.data ?? []
  const splits = splitsQuery.data?.data ?? []
  const history = historyQuery.data?.data ?? []
  const routines = routinesQuery.data?.data ?? []

  const activeSplit = useMemo(() => {
    const active = splits.find((split) => split.is_active)
    if (active) return active
    const todaySplitId = overview?.today.split?.id
    return splits.find((split) => split.id === todaySplitId) ?? null
  }, [overview?.today.split?.id, splits])

  const isLoading =
    overviewQuery.isLoading ||
    exercisesQuery.isLoading ||
    splitsQuery.isLoading ||
    routinesQuery.isLoading ||
    historyQuery.isLoading

  const isError =
    overviewQuery.isError ||
    exercisesQuery.isError ||
    splitsQuery.isError ||
    routinesQuery.isError ||
    historyQuery.isError

  const isRefetching =
    overviewQuery.isRefetching ||
    exercisesQuery.isRefetching ||
    splitsQuery.isRefetching ||
    routinesQuery.isRefetching ||
    historyQuery.isRefetching

  const refetchAll = () => {
    void Promise.all([
      overviewQuery.refetch(),
      exercisesQuery.refetch(),
      splitsQuery.refetch(),
      routinesQuery.refetch(),
      historyQuery.refetch(),
    ])
  }

  const openCreateRoutine = (returnToSplit = false) => {
    setReturnToSplitAfterRoutine(returnToSplit)
    if (returnToSplit) setCreateSplitOpen(false)
    setCreateRoutineOpen(true)
  }

  const openActiveWorkout = () => {
    const sessionId = overview?.active_session?.id ?? activeSessionId
    if (!sessionId) {
      showToast({
        type: 'info',
        heading: 'No active workout',
        subheading: 'Start today’s routine first.',
      })
      return
    }
    setActiveSessionId(sessionId)
    setActiveWorkoutOpen(true)
  }

  const handleStartWorkout = async () => {
    if (!overview) return

    if (overview.active_session) {
      setActiveSessionId(overview.active_session.id)
      setActiveWorkoutOpen(true)
      return
    }

    const routine = overview.today.routine
    if (!routine || overview.today.is_rest_day) return

    try {
      const response = await startWorkoutMutation.mutateAsync({
        routine_id: routine.id,
        split_id: overview.today.split?.id,
        split_day_id: overview.today.split_day?.id,
        day_of_week: overview.day_of_week,
      })

      setActiveSessionId(response.data.id)
      setActiveWorkoutOpen(true)
      showToast({
        type: 'success',
        heading: 'Workout started',
        subheading: response.message || `${routine.name} is ready to go.`,
      })
    } catch (error) {
      showToast({
        type: 'error',
        heading: 'Could not start workout',
        subheading:
          error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  const handleActivateSplit = async (splitId: string) => {
    try {
      const response = await activateSplitMutation.mutateAsync(splitId)
      setChangeSplitOpen(false)
      showToast({
        type: 'success',
        heading: 'Workout split updated',
        subheading: response.message || `${response.data.name} is now active.`,
      })
    } catch (error) {
      showToast({
        type: 'error',
        heading: 'Could not change split',
        subheading:
          error instanceof Error ? error.message : 'Please try again.',
      })
    }
  }

  const handleCreateRoutine = async (input: CreateWorkoutRoutineInput) => {
    try {
      const response = await createRoutineMutation.mutateAsync(input)
      const shouldReturnToSplit = returnToSplitAfterRoutine

      setCreateRoutineOpen(false)
      setReturnToSplitAfterRoutine(false)

      showToast({
        type: 'success',
        heading: 'Workout routine created',
        subheading: response.message || `${response.data.name} was created.`,
      })

      if (shouldReturnToSplit) {
        setCreateSplitOpen(true)
      }
    } catch (error) {
      showToast({
        type: 'error',
        heading: 'Could not create routine',
        subheading:
          error instanceof Error ? error.message : 'Please try again.',
      })
      throw error
    }
  }

  const handleCreateSplit = async (input: CreateWorkoutSplitInput) => {
    try {
      const response = await createSplitMutation.mutateAsync(input)
      setCreateSplitOpen(false)
      showToast({
        type: 'success',
        heading: 'Workout split created',
        subheading: response.message || `${response.data.name} was created.`,
      })
    } catch (error) {
      showToast({
        type: 'error',
        heading: 'Could not create split',
        subheading:
          error instanceof Error ? error.message : 'Please try again.',
      })
      throw error
    }
  }

  if (isLoading) return <WorkoutSkeleton />

  if (isError || !overview) {
    return (
      <WorkoutErrorState onRetry={refetchAll} isRetrying={isRefetching} />
    )
  }

  return (
    <>
      <WorkoutHeader
        search={search}
        onSearchChange={setSearch}
        onOpenSidebar={openSidebar}
      />

      <WorkoutContent
        overview={overview}
        activeSplit={activeSplit}
        splitsCount={splits.length}
        routinesCount={routines.length}
        history={history}
        search={search}
        isStarting={startWorkoutMutation.isPending}
        onStartWorkout={handleStartWorkout}
        onOpenActiveWorkout={openActiveWorkout}
        onChangeSplit={() => setChangeSplitOpen(true)}
        onCreateSplit={() => setCreateSplitOpen(true)}
        onCreateRoutine={() => openCreateRoutine(false)}
        onSelectExercise={setSelectedExercise}
      />

      <ChangeWorkoutSplitModal
        open={changeSplitOpen}
        splits={splits}
        currentSplitId={activeSplit?.id ?? null}
        isSubmitting={activateSplitMutation.isPending}
        onClose={() => setChangeSplitOpen(false)}
        onConfirm={handleActivateSplit}
      />

      <CreateWorkoutRoutineModal
        open={createRoutineOpen}
        exercises={exercises}
        isSubmitting={createRoutineMutation.isPending}
        onClose={() => {
          setCreateRoutineOpen(false)
          setReturnToSplitAfterRoutine(false)
        }}
        onCreate={handleCreateRoutine}
      />

      <CreateWorkoutSplitModal
        open={createSplitOpen}
        routines={routines}
        isSubmitting={createSplitMutation.isPending}
        onClose={() => setCreateSplitOpen(false)}
        onCreate={handleCreateSplit}
        onCreateRoutine={() => openCreateRoutine(true)}
      />

      <ExerciseDetailsModal
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />

      <ActiveWorkoutModal
        open={activeWorkoutOpen}
        sessionId={activeSessionId ?? overview.active_session?.id ?? null}
        onClose={() => {
          setActiveWorkoutOpen(false)
          setActiveSessionId(null)
        }}
      />
    </>
  )
}

export default WorkoutsPage
