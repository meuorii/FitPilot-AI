import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from 'react'
import {
  Check,
  FastForward,
  Flag,
  Info,
  Plus,
  TimerReset,
  X,
} from 'lucide-react'
import {
  useAbandonWorkout,
  useCompleteWorkout,
  useLogWorkoutSet,
  useWorkoutSession,
} from '../../../hooks/useWorkout'
import type { WorkoutExercise } from '../../../services/types/workout'
import { useToastStore } from '../../../stores/toastStore'
import { WorkoutExerciseImage } from '../WorkoutExerciseImage'
import {
  getExerciseInstructions,
  resolveWorkoutExercise,
} from '../workoutExercise.utils'

interface ActiveWorkoutModalProps {
  open: boolean
  sessionId: string | null
  exerciseLibrary: WorkoutExercise[]
  onClose: () => void
}

const formatTimer = (
  seconds: number,
) => {
  const minutes = Math.floor(
    seconds / 60,
  )
  const remainder = seconds % 60

  return `${minutes
    .toString()
    .padStart(2, '0')}:${remainder
    .toString()
    .padStart(2, '0')}`
}

export function ActiveWorkoutModal({
  open,
  sessionId,
  exerciseLibrary,
  onClose,
}: ActiveWorkoutModalProps) {
  const showToast =
    useToastStore(
      (state) =>
        state.showToast,
    )

  const sessionQuery =
    useWorkoutSession(
      open
        ? sessionId
        : null,
    )

  const logSet =
    useLogWorkoutSet(
      sessionId,
    )

  const completeWorkout =
    useCompleteWorkout(
      sessionId,
    )

  const abandonWorkout =
    useAbandonWorkout(
      sessionId,
    )

  const [weight, setWeight] =
    useState('')

  const [reps, setReps] =
    useState('')

  const [
    restSeconds,
    setRestSeconds,
  ] = useState(0)

  const [
    confirmFinish,
    setConfirmFinish,
  ] = useState(false)

  const session =
    sessionQuery.data?.data ??
    null

  const current =
    session?.progress
      .current_exercise ??
    null

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

  const previousSet =
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
    }, [session, current])

  useEffect(() => {
    if (!open) return

    const handleKey = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === 'Escape' &&
        !logSet.isPending &&
        !completeWorkout.isPending &&
        !abandonWorkout.isPending
      ) {
        if (confirmFinish) {
          setConfirmFinish(false)
        } else {
          onClose()
        }
      }
    }

    window.addEventListener(
      'keydown',
      handleKey,
    )

    return () =>
      window.removeEventListener(
        'keydown',
        handleKey,
      )
  }, [
    open,
    confirmFinish,
    logSet.isPending,
    completeWorkout.isPending,
    abandonWorkout.isPending,
    onClose,
  ])

  useEffect(() => {
    if (!current) {
      setWeight('')
      setReps('')
      return
    }

    setWeight(
      previousSet
        ? String(
            previousSet.weight_kg,
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
    previousSet?.id,
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

  if (
    !open ||
    !sessionId
  ) {
    return null
  }

  const busy =
    logSet.isPending ||
    completeWorkout.isPending ||
    abandonWorkout.isPending

  const nextSetNumber =
    current?.next_set_number ??
    null

  const numericWeight =
    Number(weight)

  const numericReps =
    Number(reps)

  const canLog =
    Boolean(
      current &&
        nextSetNumber,
    ) &&
    Number.isFinite(
      numericWeight,
    ) &&
    numericWeight >= 0 &&
    Number.isFinite(
      numericReps,
    ) &&
    numericReps > 0

  const handleCompleteSet =
    async () => {
      if (
        !current ||
        !nextSetNumber ||
        !canLog
      ) {
        return
      }

      try {
        const response =
          await logSet.mutateAsync({
            exercise_id:
              current.exercise_id,
            set_number:
              nextSetNumber,
            weight_kg:
              numericWeight,
            reps:
              numericReps,
            set_type: 'working',
          })

        setRestSeconds(
          response.data.rest
            .should_start
            ? response.data.rest
                .rest_seconds
            : 0,
        )

        await sessionQuery.refetch()

        showToast({
          type: 'success',
          heading:
            'Set completed',
          subheading:
            response.message ||
            'Your set was saved.',
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

  const handleFinish =
    async () => {
      try {
        await completeWorkout.mutateAsync(
          {},
        )

        showToast({
          type: 'success',
          heading:
            'Workout complete',
          subheading:
            'Great work. Your session has been saved.',
        })

        setConfirmFinish(false)
        onClose()
      } catch (error) {
        showToast({
          type: 'error',
          heading:
            'Could not finish workout',
          subheading:
            error instanceof Error
              ? error.message
              : 'Please try again.',
        })
      }
    }

  const handleAbandon =
    async () => {
      try {
        await abandonWorkout.mutateAsync()

        showToast({
          type: 'info',
          heading:
            'Workout ended',
          subheading:
            'Your completed sets were kept, but the workout was not marked complete.',
        })

        setConfirmFinish(false)
        onClose()
      } catch (error) {
        showToast({
          type: 'error',
          heading:
            'Could not end workout',
          subheading:
            error instanceof Error
              ? error.message
              : 'Please try again.',
        })
      }
    }

  const currentIndex =
    current && session
      ? session.progress.exercise_progress.findIndex(
          (item) =>
            item.exercise_id ===
            current.exercise_id,
        )
      : -1

  return (
    <div className="fixed inset-0 z-[90] bg-[#201D24]/70 p-0 backdrop-blur-[3px] sm:p-4 lg:p-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="active-workout-title"
        className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden bg-[#F5F3F6] shadow-[0_30px_100px_rgba(20,18,24,0.35)] sm:rounded-[28px]"
      >
        <div className="flex items-center justify-between gap-4 border-b border-[#E6E2E8] bg-white px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7482A4]">
              Active Workout
            </p>

            <h2
              id="active-workout-title"
              className="mt-1 truncate text-xl font-extrabold text-[#38323F] sm:text-2xl"
            >
              {session?.routine?.name ??
                'Workout Session'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close active workout"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F5F3F6] text-[#5F5963] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {sessionQuery.isLoading ? (
          <div className="grid flex-1 place-items-center text-sm font-semibold text-[#7482A4]">
            Loading active
            session...
          </div>
        ) : sessionQuery.isError ||
          !session ? (
          <div className="grid flex-1 place-items-center p-6 text-center">
            <div>
              <p className="font-extrabold text-[#38323F]">
                Couldn&apos;t load
                this workout
                session.
              </p>

              <button
                type="button"
                onClick={() =>
                  sessionQuery.refetch()
                }
                className="mt-3 rounded-xl bg-[#7482A4] px-4 py-2 text-sm font-bold text-white"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,.65fr)]">
              <div className="rounded-[24px] border border-[#EAE7EC] bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[#7482A4]">
                      Current Exercise
                    </p>

                    <h3 className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-[#38323F]">
                      {currentExercise?.name ??
                        (current
                          ? 'Exercise unavailable'
                          : 'All planned exercises complete')}
                    </h3>

                    {current ? (
                      <p className="mt-2 text-sm text-[#817B85]">
                        Exercise{' '}
                        {Math.max(
                          currentIndex +
                            1,
                          1,
                        )}{' '}
                        of{' '}
                        {
                          session
                            .progress
                            .planned_exercises
                        }{' '}
                        · Set{' '}
                        {nextSetNumber ??
                          current.target_sets}{' '}
                        of{' '}
                        {
                          current.target_sets
                        }
                      </p>
                    ) : null}
                  </div>

                  {current ? (
                    <span className="rounded-full bg-[#F2F3F7] px-3 py-1.5 text-xs font-bold text-[#7482A4]">
                      {
                        current.target_reps_min
                      }
                      –
                      {
                        current.target_reps_max
                      }{' '}
                      reps
                    </span>
                  ) : null}
                </div>

                {current ? (
                  <>
                    <div className="mt-5 grid gap-5 md:grid-cols-[240px_minmax(0,1fr)]">
                      <WorkoutExerciseImage
                        imageUrl={
                          currentExercise?.image_url
                        }
                        name={
                          currentExercise?.name ??
                          'Current exercise'
                        }
                        className="h-60 w-full rounded-2xl md:h-[240px]"
                      />

                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          {currentExercise?.category ? (
                            <span className="rounded-full bg-[#7482A4]/10 px-2.5 py-1 text-[10px] font-extrabold text-[#7482A4]">
                              {
                                currentExercise.category
                              }
                            </span>
                          ) : null}

                          {currentExercise?.equipment ? (
                            <span className="rounded-full bg-[#F3F1F4] px-2.5 py-1 text-[10px] font-extrabold text-[#6F6A74]">
                              {
                                currentExercise.equipment
                              }
                            </span>
                          ) : null}

                          {currentExercise?.difficulty ? (
                            <span className="rounded-full bg-[#F3F1F4] px-2.5 py-1 text-[10px] font-extrabold capitalize text-[#6F6A74]">
                              {
                                currentExercise.difficulty
                              }
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-4 rounded-2xl bg-[#FAF9FB] p-4">
                          <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-[#7482A4]" />
                            <h4 className="text-xs font-extrabold text-[#38323F]">
                              How to perform
                            </h4>
                          </div>

                          {instructions.length >
                          0 ? (
                            <ol className="mt-3 space-y-2.5">
                              {instructions.map(
                                (
                                  instruction,
                                  index,
                                ) => (
                                  <li
                                    key={`${instruction}-${index}`}
                                    className="flex gap-2.5 text-xs leading-5 text-[#6F6A74]"
                                  >
                                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#7482A4]/10 text-[9px] font-extrabold text-[#7482A4]">
                                      {index +
                                        1}
                                    </span>
                                    <span>
                                      {
                                        instruction
                                      }
                                    </span>
                                  </li>
                                ),
                              )}
                            </ol>
                          ) : (
                            <p className="mt-2 text-xs leading-5 text-[#8B8690]">
                              No exercise
                              instructions
                              were provided.
                            </p>
                          )}
                        </div>

                        {current.notes ? (
                          <p className="mt-3 rounded-xl border border-[#7482A4]/10 bg-[#F5F6F9] px-3 py-2.5 text-xs leading-5 text-[#6F6A74]">
                            <strong className="font-extrabold text-[#38323F]">
                              Routine note:
                            </strong>{' '}
                            {
                              current.notes
                            }
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <label className="rounded-2xl border border-[#EAE7EC] p-4">
                        <span className="text-xs font-bold text-[#817B85]">
                          Weight (kg)
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
                              event
                                .target
                                .value,
                            )
                          }
                          className="mt-2 w-full bg-transparent text-3xl font-extrabold text-[#38323F] outline-none"
                          placeholder="0"
                        />
                      </label>

                      <label className="rounded-2xl border border-[#EAE7EC] p-4">
                        <span className="text-xs font-bold text-[#817B85]">
                          Completed reps
                        </span>

                        <input
                          type="number"
                          min="1"
                          value={reps}
                          onChange={(
                            event: ChangeEvent<HTMLInputElement>,
                          ) =>
                            setReps(
                              event
                                .target
                                .value,
                            )
                          }
                          className="mt-2 w-full bg-transparent text-3xl font-extrabold text-[#38323F] outline-none"
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleCompleteSet
                      }
                      disabled={
                        !canLog ||
                        logSet.isPending
                      }
                      className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#7482A4] px-5 text-sm font-extrabold text-white transition hover:bg-[#667493] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Check className="h-5 w-5" />
                      {logSet.isPending
                        ? 'Saving Set...'
                        : 'Complete Set'}
                    </button>
                  </>
                ) : (
                  <div className="mt-6 rounded-2xl bg-[#F2F3F7] p-6 text-center text-sm font-semibold text-[#68728D]">
                    All planned sets are
                    complete. You can
                    finish the workout
                    when you&apos;re
                    ready.
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <div className="rounded-[24px] border border-[#EAE7EC] bg-white p-5">
                  <div className="flex items-center gap-2 text-[#7482A4]">
                    <TimerReset className="h-5 w-5" />
                    <span className="text-xs font-bold">
                      Rest Timer
                    </span>
                  </div>

                  <p className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-[#38323F]">
                    {formatTimer(
                      restSeconds,
                    )}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setRestSeconds(
                          0,
                        )
                      }
                      disabled={
                        restSeconds ===
                        0
                      }
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E0DDE4] px-3 py-2.5 text-xs font-bold text-[#5F5963] disabled:opacity-45"
                    >
                      <FastForward className="h-4 w-4" />
                      Skip Rest
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setRestSeconds(
                          (value) =>
                            value +
                            30,
                        )
                      }
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E0DDE4] px-3 py-2.5 text-xs font-bold text-[#5F5963]"
                    >
                      <Plus className="h-4 w-4" />
                      +30 sec
                    </button>
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#EAE7EC] bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-extrabold text-[#38323F]">
                      Session Progress
                    </p>

                    <span className="text-sm font-extrabold text-[#7482A4]">
                      {Math.round(
                        Math.min(
                          100,
                          session.progress
                            .percentage,
                        ),
                      )}
                      %
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E7E9EF]">
                    <div
                      className="h-full rounded-full bg-[#7482A4]"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            session
                              .progress
                              .percentage,
                          ),
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-3 divide-x divide-[#EAE7EC] text-center text-xs">
                    <div>
                      <p className="font-extrabold text-[#38323F]">
                        {
                          session.progress
                            .completed_exercises
                        }
                        /
                        {
                          session.progress
                            .planned_exercises
                        }
                      </p>
                      <p className="mt-1 text-[10px] text-[#8B8690]">
                        exercises
                      </p>
                    </div>

                    <div>
                      <p className="font-extrabold text-[#38323F]">
                        {
                          session.progress
                            .completed_sets
                        }
                        /
                        {
                          session.progress
                            .planned_sets
                        }
                      </p>
                      <p className="mt-1 text-[10px] text-[#8B8690]">
                        sets
                      </p>
                    </div>

                    <div>
                      <p className="font-extrabold text-[#38323F]">
                        {session.total_volume_kg.toLocaleString()}{' '}
                        kg
                      </p>
                      <p className="mt-1 text-[10px] text-[#8B8690]">
                        volume
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setConfirmFinish(
                      true,
                    )
                  }
                  disabled={busy}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#38323F] px-5 text-sm font-extrabold text-white transition hover:bg-[#4A4350] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2 disabled:opacity-50"
                >
                  <Flag className="h-4 w-4" />
                  Finish Workout
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {confirmFinish &&
      session ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-[#201D24]/55 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl"
          >
            <h3 className="text-xl font-extrabold text-[#38323F]">
              Finish this workout?
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#817B85]">
              {session.progress
                .percentage < 100
                ? 'Some planned sets are still incomplete. You can finish now or end the session without marking it complete.'
                : 'Your planned sets are complete. Finish and save this workout?'}
            </p>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setConfirmFinish(
                    false,
                  )
                }
                disabled={busy}
                className="rounded-xl border border-[#DED9E1] px-4 py-2.5 text-sm font-bold text-[#5F5963]"
              >
                Cancel
              </button>

              {session.progress
                .percentage < 100 ? (
                <button
                  type="button"
                  onClick={
                    handleAbandon
                  }
                  disabled={busy}
                  className="rounded-xl border border-[#D6D1D9] bg-[#F7F5F8] px-4 py-2.5 text-sm font-bold text-[#5F5963] disabled:opacity-50"
                >
                  {abandonWorkout.isPending
                    ? 'Ending...'
                    : 'End Without Completing'}
                </button>
              ) : null}

              <button
                type="button"
                onClick={
                  handleFinish
                }
                disabled={busy}
                className="rounded-xl bg-[#7482A4] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                {completeWorkout.isPending
                  ? 'Finishing...'
                  : 'Finish Workout'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
