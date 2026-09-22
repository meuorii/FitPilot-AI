import { useEffect, type MouseEvent } from 'react'
import {
  Dumbbell,
  Timer,
  X,
} from 'lucide-react'
import type {
  WorkoutExercise,
  WorkoutRoutineExercise,
} from '../../../services/types/workout'
import { WorkoutExerciseImage } from '../WorkoutExerciseImage'
import {
  getExerciseInstructions,
  resolveWorkoutExercise,
} from '../workoutExercise.utils'

interface ExerciseDetailsModalProps {
  exercise: WorkoutRoutineExercise | null
  exerciseLibrary: WorkoutExercise[]
  onClose: () => void
}

const formatRest = (
  seconds: number,
) => {
  const safeSeconds = Math.max(
    0,
    Number(seconds) || 0,
  )
  const minutes = Math.floor(
    safeSeconds / 60,
  )
  const remaining =
    safeSeconds % 60

  return `${minutes}:${remaining
    .toString()
    .padStart(2, '0')}`
}

export function ExerciseDetailsModal({
  exercise,
  exerciseLibrary,
  onClose,
}: ExerciseDetailsModalProps) {
  useEffect(() => {
    if (!exercise) return

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === 'Escape'
      ) {
        onClose()
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () =>
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )
  }, [exercise, onClose])

  if (!exercise) return null

  const details =
    resolveWorkoutExercise(
      exercise.exercise_id,
      exercise.exercises,
      exerciseLibrary,
    )

  const instructions =
    getExerciseInstructions(
      details,
    )

  const name =
    details?.name ??
    'Exercise unavailable'

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-[#27232B]/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(
        event: MouseEvent<HTMLDivElement>,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="exercise-details-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[24px] bg-white p-5 shadow-[0_28px_80px_rgba(25,22,30,0.22)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7482A4]">
              Exercise Details
            </p>

            <h2
              id="exercise-details-title"
              className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-[#38323F]"
            >
              {name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close exercise details"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F5F3F6] text-[#6F6A74] transition hover:bg-[#ECE9EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <WorkoutExerciseImage
          imageUrl={
            details?.image_url
          }
          name={name}
          className="mt-5 h-64 w-full rounded-2xl"
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#F8F7FA] p-4">
            <div className="flex items-center gap-2 text-[#7482A4]">
              <Dumbbell className="h-4 w-4" />
              <span className="text-xs font-bold">
                Plan
              </span>
            </div>

            <p className="mt-2 text-sm font-extrabold text-[#38323F]">
              {exercise.target_sets}{' '}
              sets ×{' '}
              {
                exercise.target_reps_min
              }
              –
              {
                exercise.target_reps_max
              }{' '}
              reps
            </p>
          </div>

          <div className="rounded-2xl bg-[#F8F7FA] p-4">
            <div className="flex items-center gap-2 text-[#7482A4]">
              <Timer className="h-4 w-4" />
              <span className="text-xs font-bold">
                Rest
              </span>
            </div>

            <p className="mt-2 text-sm font-extrabold text-[#38323F]">
              {formatRest(
                exercise.rest_seconds,
              )}
            </p>
          </div>
        </div>

        <dl className="mt-5 grid gap-4 rounded-2xl border border-[#EAE7EC] p-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold text-[#8B8690]">
              Muscle group / category
            </dt>
            <dd className="mt-1 text-sm font-bold text-[#38323F]">
              {details?.category ||
                'Not provided'}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-[#8B8690]">
              Equipment
            </dt>
            <dd className="mt-1 text-sm font-bold text-[#38323F]">
              {details?.equipment ||
                'Not provided'}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-[#8B8690]">
              Difficulty
            </dt>
            <dd className="mt-1 text-sm font-bold text-[#38323F]">
              {details?.difficulty ||
                'Not provided'}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold text-[#8B8690]">
              Routine note
            </dt>
            <dd className="mt-1 text-sm font-bold text-[#38323F]">
              {exercise.notes ||
                'No note'}
            </dd>
          </div>
        </dl>

        <div className="mt-5">
          <h3 className="text-sm font-extrabold text-[#38323F]">
            Instructions
          </h3>

          {instructions.length > 0 ? (
            <ol className="mt-3 space-y-2">
              {instructions.map(
                (
                  instruction,
                  index,
                ) => (
                  <li
                    key={`${instruction}-${index}`}
                    className="flex gap-3 text-sm leading-6 text-[#6F6A74]"
                  >
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#F2F3F7] text-[11px] font-extrabold text-[#7482A4]">
                      {index + 1}
                    </span>
                    <span>
                      {instruction}
                    </span>
                  </li>
                ),
              )}
            </ol>
          ) : (
            <p className="mt-2 rounded-2xl bg-[#FAF9FB] p-4 text-sm text-[#8B8690]">
              No exercise instructions
              were provided for this
              exercise.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
