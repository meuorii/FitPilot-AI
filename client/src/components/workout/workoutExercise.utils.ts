import type {
  WorkoutExercise,
  WorkoutRoutine,
} from '../../services/types/workout'

export const resolveWorkoutExercise = (
  exerciseId: string,
  nestedExercise: WorkoutExercise | null | undefined,
  exerciseLibrary: WorkoutExercise[],
): WorkoutExercise | null =>
  nestedExercise ??
  exerciseLibrary.find(
    (exercise) =>
      exercise.id === exerciseId,
  ) ??
  null

export const getExerciseInstructions = (
  exercise: WorkoutExercise | null | undefined,
): string[] =>
  Array.isArray(exercise?.instructions)
    ? exercise.instructions.filter(
        (instruction) =>
          typeof instruction === 'string' &&
          instruction.trim().length > 0,
      )
    : []

export const chooseDisplayRoutine = (
  routines: Array<
    WorkoutRoutine | null | undefined
  >,
): WorkoutRoutine | null => {
  const available = routines.filter(
    (
      routine,
    ): routine is WorkoutRoutine =>
      Boolean(routine),
  )

  return (
    available.find(
      (routine) =>
        routine.routine_exercises.length >
        0,
    ) ??
    available[0] ??
    null
  )
}
