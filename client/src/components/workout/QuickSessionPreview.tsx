import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from 'react'
import {
  Check,
  Expand,
  FastForward,
  Plus,
  TimerReset,
} from 'lucide-react'
import { useLogWorkoutSet } from '../../hooks/useWorkout'
import type {
  WorkoutExercise,
  WorkoutSessionDetails,
} from '../../services/types/workout'
import { useToastStore } from '../../stores/toastStore'
import { WorkoutExerciseImage } from './WorkoutExerciseImage'
import {
  getExerciseInstructions,
  resolveWorkoutExercise,
} from './workoutExercise.utils'

interface QuickSessionPreviewProps {
  session: WorkoutSessionDetails | null
  exerciseLibrary: WorkoutExercise[]
  onOpenFullScreen: () => void
}

const formatTimer = (
  seconds: number,
) => {
  const minutes = Math.floor(
    seconds / 60,
  )
  const remaining = seconds % 60

  return `${minutes
    .toString()
    .padStart(2, '0')}:${remaining
    .toString()
    .padStart(2, '0')}`
}

export function QuickSessionPreview({
  session,
  exerciseLibrary,
  onOpenFullScreen,
}: QuickSessionPreviewProps) {
  const showToast =
    useToastStore(
      (state) =>
        state.showToast,
    )

  const mutation =
    useLogWorkoutSet(
      session?.id ?? null,
    )

  const current =
    session?.progress
      .current_exercise ?? null

  const currentExercise =
    current
      ? resolveWorkoutExercise(
          current.exercise_id,
          current.exercise,
          exerciseLibrary,
        )
      : null

  const instructions =
    getExerciseInstructions(
      currentExercise,
    )

  const [weight, setWeight] =
    useState('')
  const [reps, setReps] =
    useState('')
  const [
    restSeconds,
    setRestSeconds,
  ] = useState(0)

  const lastMatchingSet =
    useMemo(() => {
      if (
        !session ||
        !current
      ) {
        return null
      }

      return (
        session.sets
          .filter(
            (set) =>
              set.exercise_id ===
              current.exercise_id,
          )
          .sort(
            (a, b) =>
              b.set_number -
              a.set_number,
          )[0] ?? null
      )
    }, [current, session])

  useEffect(() => {
    if (!current) {
      setWeight('')
      setReps('')
      return
    }

    setWeight(
      lastMatchingSet
        ? String(
            lastMatchingSet.weight_kg,
          )
        : '',
    )

    setReps(
      String(
        current.target_reps_min,
      ),
    )
  }, [
    current?.exercise_id,
    lastMatchingSet?.id,
  ])

  useEffect(() => {
    if (restSeconds <= 0) {
      return
    }

    const timer =
      window.setInterval(() => {
        setRestSeconds(
          (value) =>
            Math.max(
              0,
              value - 1,
            ),
        )
      }, 1000)

    return () =>
      window.clearInterval(timer)
  }, [restSeconds > 0])

  if (!session) {
    return (
      <section className="rounded-[24px] border border-[#EAE7EC] bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
        <h2 className="text-lg font-extrabold tracking-[-0.02em] text-[#38323F]">
          Quick Session Preview
        </h2>

        <div className="mt-5 rounded-2xl bg-[#F7F6F8] px-5 py-8 text-center">
          <TimerReset className="mx-auto h-8 w-8 text-[#7482A4]" />

          <p className="mt-3 text-sm font-extrabold text-[#38323F]">
            No active workout
          </p>

          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#8B8690]">
            Start today&apos;s
            routine to see the
            current exercise, image,
            instructions, sets, and
            rest timer here.
          </p>
        </div>
      </section>
    )
  }

  const progress =
    session.progress

  const percentage = Math.min(
    100,
    Math.max(
      0,
      progress.percentage,
    ),
  )

  const nextSetNumber =
    current?.next_set_number ??
    null

  const validWeight =
    Number(weight)
  const validReps = Number(reps)

  const canComplete =
    Boolean(
      current &&
        nextSetNumber,
    ) &&
    Number.isFinite(
      validWeight,
    ) &&
    validWeight >= 0 &&
    Number.isFinite(validReps) &&
    validReps > 0

  const handleCompleteSet =
    async () => {
      if (
        !current ||
        !nextSetNumber ||
        !canComplete
      ) {
        return
      }

      try {
        const response =
          await mutation.mutateAsync({
            exercise_id:
              current.exercise_id,
            set_number:
              nextSetNumber,
            weight_kg:
              validWeight,
            reps: validReps,
            set_type: 'working',
          })

        setRestSeconds(
          response.data.rest
            .should_start
            ? response.data.rest
                .rest_seconds
            : 0,
        )

        showToast({
          type: 'success',
          heading:
            'Set completed',
          subheading:
            response.message ||
            'Your workout progress has been saved.',
        })
      } catch (error) {
        showToast({
          type: 'error',
          heading:
            'Could not save set',
          subheading:
            error instanceof Error
              ? error.message
              : 'Please try again.',
        })
      }
    }

  return (
    <section className="rounded-[24px] border border-[#EAE7EC] bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold tracking-[-0.02em] text-[#38323F]">
            Quick Session Preview
          </h2>

          <p className="mt-1 text-xs text-[#8B8690]">
            Live workout tracking
          </p>
        </div>

        <button
          type="button"
          onClick={
            onOpenFullScreen
          }
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#F3F4F7] px-3 py-2 text-xs font-bold text-[#7482A4] transition hover:bg-[#E9EBF0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
        >
          Full Screen
          <Expand className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-5 rounded-2xl bg-[#F9F9FC] p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#7482A4]">
          Current Exercise
        </p>

        {current ? (
          <div className="mt-3 grid gap-4 sm:grid-cols-[104px_minmax(0,1fr)]">
            <WorkoutExerciseImage
              imageUrl={
                currentExercise?.image_url
              }
              name={
                currentExercise?.name ??
                'Current exercise'
              }
              className="h-28 w-full rounded-2xl sm:h-[104px] sm:w-[104px]"
            />

            <div className="min-w-0">
              <p className="line-clamp-2 text-base font-extrabold text-[#38323F]">
                {currentExercise?.name ??
                  'Exercise unavailable'}
              </p>

              <p className="mt-1 text-[11px] font-semibold text-[#817B85]">
                {[
                  currentExercise?.category,
                  currentExercise?.equipment,
                ]
                  .filter(Boolean)
                  .join(' · ') ||
                  'Exercise details unavailable'}
              </p>

              {instructions[0] ? (
                <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#8B8690]">
                  {instructions[0]}
                </p>
              ) : current.notes ? (
                <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#8B8690]">
                  {current.notes}
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-base font-extrabold text-[#38323F]">
            Workout complete
          </p>
        )}

        {current ? (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
            <div className="rounded-xl border border-[#EAE7EC] bg-white p-3">
              <p className="text-[10px] font-semibold text-[#8B8690]">
                Set Progress
              </p>
              <p className="mt-1 text-sm font-extrabold text-[#38323F]">
                {nextSetNumber ??
                  current.target_sets}{' '}
                of{' '}
                {current.target_sets}
              </p>
            </div>

            <div className="rounded-xl border border-[#EAE7EC] bg-white p-3">
              <p className="text-[10px] font-semibold text-[#8B8690]">
                Target Reps
              </p>
              <p className="mt-1 text-sm font-extrabold text-[#38323F]">
                {
                  current.target_reps_min
                }
                –
                {
                  current.target_reps_max
                }
              </p>
            </div>

            <label className="rounded-xl border border-[#EAE7EC] bg-white p-3">
              <span className="block text-[10px] font-semibold text-[#8B8690]">
                Weight kg
              </span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={weight}
                onChange={(
                  event: ChangeEvent<HTMLInputElement>,
                ) =>
                  setWeight(
                    event.target.value,
                  )
                }
                className="mt-1 w-full bg-transparent text-sm font-extrabold text-[#38323F] outline-none"
                aria-label="Weight in kilograms"
              />
            </label>

            <label className="rounded-xl border border-[#EAE7EC] bg-white p-3">
              <span className="block text-[10px] font-semibold text-[#8B8690]">
                Reps
              </span>
              <input
                type="number"
                min="1"
                value={reps}
                onChange={(
                  event: ChangeEvent<HTMLInputElement>,
                ) =>
                  setReps(
                    event.target.value,
                  )
                }
                className="mt-1 w-full bg-transparent text-sm font-extrabold text-[#38323F] outline-none"
                aria-label="Completed repetitions"
              />
            </label>

            <div className="rounded-xl border border-[#EAE7EC] bg-white p-3">
              <p className="text-[10px] font-semibold text-[#8B8690]">
                Rest Timer
              </p>
              <p className="mt-1 text-sm font-extrabold text-[#7482A4]">
                {formatTimer(
                  restSeconds,
                )}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {current ? (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={
              handleCompleteSet
            }
            disabled={
              !canComplete ||
              mutation.isPending
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#7482A4] px-4 text-xs font-extrabold text-white transition hover:bg-[#667493] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55"
          >
            <Check className="h-4 w-4" />
            {mutation.isPending
              ? 'Saving...'
              : 'Complete Set'}
          </button>

          <button
            type="button"
            onClick={() =>
              setRestSeconds(0)
            }
            disabled={
              restSeconds === 0
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#E0DDE4] px-4 text-xs font-extrabold text-[#5F5963] transition hover:bg-[#FAF9FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] disabled:opacity-45"
          >
            <FastForward className="h-4 w-4" />
            Skip Rest
          </button>

          <button
            type="button"
            onClick={() =>
              setRestSeconds(
                (value) =>
                  value + 30,
              )
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#E0DDE4] px-4 text-xs font-extrabold text-[#5F5963] transition hover:bg-[#FAF9FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            <Plus className="h-4 w-4" />
            +30 sec
          </button>
        </div>
      ) : null}

      <div className="mt-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold text-[#5F5963]">
            Session Progress
          </p>
          <p className="text-xs font-extrabold text-[#7482A4]">
            {Math.round(
              percentage,
            )}
            %
          </p>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E7E9EF]">
          <div
            className="h-full rounded-full bg-[#7482A4] transition-[width] duration-300"
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 divide-x divide-[#EAE7EC] text-center">
          <div>
            <p className="text-sm font-extrabold text-[#38323F]">
              {
                progress.completed_exercises
              }{' '}
              /{' '}
              {
                progress.planned_exercises
              }
            </p>
            <p className="mt-0.5 text-[10px] text-[#8B8690]">
              exercises
            </p>
          </div>

          <div>
            <p className="text-sm font-extrabold text-[#38323F]">
              {
                progress.completed_sets
              }{' '}
              /{' '}
              {
                progress.planned_sets
              }
            </p>
            <p className="mt-0.5 text-[10px] text-[#8B8690]">
              sets
            </p>
          </div>

          <div>
            <p className="text-sm font-extrabold text-[#38323F]">
              {session.total_volume_kg.toLocaleString()}{' '}
              kg
            </p>
            <p className="mt-0.5 text-[10px] text-[#8B8690]">
              volume
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
