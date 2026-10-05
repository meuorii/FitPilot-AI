import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  abandonWorkout,
  activateWorkoutSplit,
  completeWorkout,
  createRoutine,
  createWorkoutSplit,
  getExercises,
  getPreviousPerformance,
  getWorkoutHistory,
  getWorkoutOverview,
  getRoutines,
  getWorkoutSession,
  getWorkoutSplits,
  logWorkoutSet,
  startWorkout,
  updateRoutine,
} from '../services/api/workout';

import type {
  CompleteWorkoutInput,
  CreateWorkoutRoutineInput,
  CreateWorkoutSplitInput,
  LogWorkoutSetInput,
  StartWorkoutInput,
  UpdateWorkoutRoutineInput,
  WorkoutHistoryQuery,
} from '../services/types/workout';

export const workoutQueryKeys = {
  all: ['workouts'] as const,

  overview: (dayOfWeek?: number) =>
    [...workoutQueryKeys.all, 'overview', dayOfWeek ?? 'today'] as const,

  exercises: () =>
    [...workoutQueryKeys.all, 'exercises'] as const,

  splits: () =>
    [...workoutQueryKeys.all, 'splits'] as const,

  routines: () =>
    [...workoutQueryKeys.all, 'routines'] as const,

  history: (query: WorkoutHistoryQuery = {}) =>
    [
      ...workoutQueryKeys.all,
      'history',
      query.status ?? 'all',
      query.limit ?? 'default',
      query.offset ?? 0,
    ] as const,

  session: (sessionId: string) =>
    [...workoutQueryKeys.all, 'session', sessionId] as const,

  previousPerformance: (
    exerciseId: string,
    excludeSessionId?: string | null,
  ) =>
    [
      ...workoutQueryKeys.all,
      'previous-performance',
      exerciseId,
      excludeSessionId ?? 'none',
    ] as const,
};

export const useWorkoutOverview = (dayOfWeek?: number) =>
  useQuery({
    queryKey: workoutQueryKeys.overview(dayOfWeek),
    queryFn: () => getWorkoutOverview(dayOfWeek),
    staleTime: 20_000,
  });

export const useWorkoutExercises = () =>
  useQuery({
    queryKey: workoutQueryKeys.exercises(),
    queryFn: getExercises,
    staleTime: 60_000,
  });

export const useWorkoutSplits = () =>
  useQuery({
    queryKey: workoutQueryKeys.splits(),
    queryFn: getWorkoutSplits,
    staleTime: 30_000,
  });

export const useWorkoutRoutines = () =>
  useQuery({
    queryKey: workoutQueryKeys.routines(),
    queryFn: getRoutines,
    staleTime: 30_000,
  });

export const useWorkoutHistory = (query: WorkoutHistoryQuery = {}) =>
  useQuery({
    queryKey: workoutQueryKeys.history(query),
    queryFn: () => getWorkoutHistory(query),
    staleTime: 20_000,
  });

export const useWorkoutSession = (sessionId: string | null) =>
  useQuery({
    queryKey: workoutQueryKeys.session(sessionId ?? 'inactive'),
    queryFn: () => getWorkoutSession(sessionId ?? ''),
    enabled: Boolean(sessionId),
    staleTime: 5_000,
  });

export const usePreviousPerformance = (
  exerciseId: string | null,
  excludeSessionId?: string | null,
) =>
  useQuery({
    queryKey: workoutQueryKeys.previousPerformance(
      exerciseId ?? 'none',
      excludeSessionId,
    ),
    queryFn: () =>
      getPreviousPerformance(
        exerciseId ?? '',
        excludeSessionId ?? undefined,
      ),
    enabled: Boolean(exerciseId),
    staleTime: 30_000,
  });

const invalidateWorkoutData = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  await queryClient.invalidateQueries({
    queryKey: workoutQueryKeys.all,
  });
};

export const useStartWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StartWorkoutInput) => startWorkout(input),
    onSuccess: async () => invalidateWorkoutData(queryClient),
  });
};

export const useCreateWorkoutRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWorkoutRoutineInput) => createRoutine(input),
    onSuccess: async () => invalidateWorkoutData(queryClient),
  });
};

/**
 * Update an existing workout routine.
 */
export const useUpdateWorkoutRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      routineId,
      input,
    }: {
      routineId: string;
      input: UpdateWorkoutRoutineInput;
    }) => updateRoutine(routineId, input),

    onSuccess: async () => {
      await invalidateWorkoutData(queryClient);
    },
  });
};

export const useActivateWorkoutSplit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (splitId: string) => activateWorkoutSplit(splitId),
    onSuccess: async () => invalidateWorkoutData(queryClient),
  });
};

export const useCreateWorkoutSplit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWorkoutSplitInput) =>
      createWorkoutSplit(input),

    onSuccess: async () => invalidateWorkoutData(queryClient),
  });
};

export const useLogWorkoutSet = (sessionId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LogWorkoutSetInput) => {
      if (!sessionId) {
        throw new Error('No active workout session.');
      }

      return logWorkoutSet(sessionId, input);
    },

    onSuccess: async () => invalidateWorkoutData(queryClient),
  });
};

export const useCompleteWorkout = (sessionId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CompleteWorkoutInput = {}) => {
      if (!sessionId) {
        throw new Error('No active workout session.');
      }

      return completeWorkout(sessionId, input);
    },

    onSuccess: async () => invalidateWorkoutData(queryClient),
  });
};

export const useAbandonWorkout = (sessionId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!sessionId) {
        throw new Error('No active workout session.');
      }

      return abandonWorkout(sessionId);
    },

    onSuccess: async () => invalidateWorkoutData(queryClient),
  });
};