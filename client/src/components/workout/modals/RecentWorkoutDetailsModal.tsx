import {
  useEffect,
  type MouseEvent,
} from 'react'
import {
  CalendarDays,
  Check,
  Clock3,
  Dumbbell,
  Layers3,
  X,
} from 'lucide-react'
import type { WorkoutHistoryItem } from '../../../services/types/workout'
import { WorkoutExerciseImage } from '../WorkoutExerciseImage'

interface RecentWorkoutDetailsModalProps {
  open: boolean
  workout: WorkoutHistoryItem | null
  onClose: () => void
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))

const formatDuration = (
  startedAt: string,
  completedAt: string | null,
) => {
  if (!completedAt) return '—'

  const started =
    new Date(startedAt).getTime()

  const completed =
    new Date(completedAt).getTime()

  if (
    !Number.isFinite(started) ||
    !Number.isFinite(completed) ||
    completed < started
  ) {
    return '—'
  }

  const minutes = Math.max(
    1,
    Math.round(
      (completed - started) / 60_000,
    ),
  )

  return `${minutes} min`
}

export function RecentWorkoutDetailsModal({
  open,
  workout,
  onClose,
}: RecentWorkoutDetailsModalProps) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === 'Escape') {
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
  }, [open, onClose])

  if (!open || !workout) {
    return null
  }

  const completedSets =
    workout.workout_sets.filter(
      (set) => set.is_completed,
    )

  /*
   * Group completed sets by exercise.
   *
   * The history API currently exposes the
   * exercise name/category through `exercises`.
   * image_url is read defensively because the
   * history type may not yet include it.
   */
  const exercises = Array.from(
    new Map(
      completedSets.map((set) => {
        const exercise =
          set.exercises

        const exerciseWithImage =
          exercise as
            | (typeof exercise & {
                image_url?:
                  | string
                  | null
              })
            | null

        return [
          set.exercise_id,
          {
            id: set.exercise_id,
            name:
              exercise?.name ??
              'Exercise unavailable',
            category:
              exercise?.category ?? '',
            imageUrl:
              exerciseWithImage
                ?.image_url ?? null,
          },
        ]
      }),
    ).values(),
  )

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
        aria-labelledby="recent-workout-details-title"
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_28px_80px_rgba(25,22,30,0.22)]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#EAE7EC] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7482A4]">
              Workout Details
            </p>

            <h2
              id="recent-workout-details-title"
              className="mt-1 truncate text-2xl font-extrabold tracking-[-0.03em] text-[#38323F]"
            >
              {workout.workout_routines?.name ??
                'Workout'}
            </h2>

            <p className="mt-1 text-xs text-[#8B8690]">
              Completed on{' '}
              {formatDate(
                workout.workout_date,
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close workout details"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F5F3F6] text-[#6F6A74] transition hover:bg-[#ECE9EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="border-b border-[#EAE7EC] bg-[#FAF9FB] px-5 py-4 sm:px-6">
          <div className="grid grid-cols-3 divide-x divide-[#E3DFE6]">
            <SummaryStat
              icon={
                <CalendarDays className="h-4 w-4" />
              }
              label="Date"
              value={formatDate(
                workout.workout_date,
              )}
            />

            <SummaryStat
              icon={
                <Clock3 className="h-4 w-4" />
              }
              label="Duration"
              value={formatDuration(
                workout.started_at,
                workout.completed_at,
              )}
            />

            <SummaryStat
              icon={
                <Layers3 className="h-4 w-4" />
              }
              label="Sets"
              value={String(
                completedSets.length,
              )}
            />
          </div>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {exercises.length > 0 ? (
            <div className="space-y-5">
              {exercises.map(
                (exercise, index) => {
                  const exerciseSets =
                    completedSets
                      .filter(
                        (set) =>
                          set.exercise_id ===
                          exercise.id,
                      )
                      .sort(
                        (a, b) =>
                          a.set_number -
                          b.set_number,
                      )

                  return (
                    <article
                      key={exercise.id}
                      className="overflow-hidden rounded-[20px] border border-[#EAE7EC] bg-white"
                    >
                      {/* Exercise */}
                      <div className="flex items-center gap-4 p-4 sm:p-5">
                        <WorkoutExerciseImage
                          imageUrl={
                            exercise.imageUrl
                          }
                          name={
                            exercise.name
                          }
                          className="h-20 w-20 shrink-0 rounded-2xl"
                          fallbackClassName="text-[#7482A4]"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#F5F3F6] text-[10px] font-extrabold text-[#7482A4]">
                              {index + 1}
                            </span>

                            <h3 className="truncate text-[15px] font-extrabold tracking-[-0.01em] text-[#38323F]">
                              {exercise.name}
                            </h3>
                          </div>

                          {exercise.category ? (
                            <p className="mt-1 text-xs font-medium text-[#8B8690]">
                              {
                                exercise.category
                              }
                            </p>
                          ) : null}

                          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#8B8690]">
                            <Dumbbell className="h-3.5 w-3.5 text-[#7482A4]" />

                            {exerciseSets.length}{' '}
                            completed{' '}
                            {exerciseSets.length ===
                            1
                              ? 'set'
                              : 'sets'}
                          </div>
                        </div>
                      </div>

                      {/* Set list */}
                      <div className="border-t border-[#EAE7EC] bg-[#FAF9FB] px-4 py-3 sm:px-5">
                        <div className="grid grid-cols-[52px_minmax(0,1fr)_80px_70px] items-center gap-3 px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8B8690]">
                          <span>Set</span>
                          <span>Type</span>
                          <span className="text-right">
                            Weight
                          </span>
                          <span className="text-right">
                            Reps
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {exerciseSets.map(
                            (set) => (
                              <div
                                key={set.id}
                                className="grid grid-cols-[52px_minmax(0,1fr)_80px_70px] items-center gap-3 rounded-xl bg-white px-3 py-2.5"
                              >
                                <span className="text-xs font-bold text-[#5F5963]">
                                  {set.set_number}
                                </span>

                                <span className="truncate text-xs font-medium capitalize text-[#8B8690]">
                                  {set.set_type ||
                                    'Working'}
                                </span>

                                <span className="text-right text-sm font-extrabold text-[#38323F]">
                                  {
                                    set.weight_kg
                                  }{' '}
                                  <span className="text-[10px] font-bold text-[#8B8690]">
                                    kg
                                  </span>
                                </span>

                                <span className="text-right text-sm font-extrabold text-[#38323F]">
                                  {set.reps}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </article>
                  )
                },
              )}
            </div>
          ) : (
            <div className="grid place-items-center rounded-[20px] border border-dashed border-[#DCD8E1] bg-[#FAF9FB] px-5 py-12 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F5F3F6]">
                <Dumbbell className="h-5 w-5 text-[#7482A4]" />
              </div>

              <p className="mt-3 text-sm font-extrabold text-[#38323F]">
                No completed sets
              </p>

              <p className="mt-1 max-w-sm text-xs leading-5 text-[#8B8690]">
                This workout doesn't have
                any completed exercise sets
                recorded.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#EAE7EC] bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8B8690]">
                Total Volume
              </p>

              <p className="mt-0.5 text-lg font-extrabold tracking-[-0.02em] text-[#38323F]">
                {Number(
                  workout.total_volume_kg,
                ).toLocaleString()}{' '}
                <span className="text-xs font-bold text-[#8B8690]">
                  kg
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-[#7482A4]">
              <Check className="h-4 w-4" />
              Workout completed
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

interface SummaryStatProps {
  icon: React.ReactNode
  label: string
  value: string
}

function SummaryStat({
  icon,
  label,
  value,
}: SummaryStatProps) {
  return (
    <div className="min-w-0 px-3 first:pl-0 last:pr-0 sm:px-4">
      <div className="flex items-center gap-1.5 text-[#7482A4]">
        {icon}

        <span className="text-[10px] font-bold uppercase tracking-[0.08em]">
          {label}
        </span>
      </div>

      <p className="mt-1 truncate text-xs font-extrabold text-[#38323F]">
        {value}
      </p>
    </div>
  )
}