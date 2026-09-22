import {
  ChevronRight,
  ClipboardList,
  Dumbbell,
  Timer,
} from 'lucide-react'
import type {
  WorkoutExercise,
  WorkoutRoutine,
  WorkoutRoutineExercise,
} from '../../services/types/workout'
import { WorkoutExerciseImage } from './WorkoutExerciseImage'
import {
  getExerciseInstructions,
  resolveWorkoutExercise,
} from './workoutExercise.utils'

interface TodayExerciseListProps {
  routine: WorkoutRoutine | null
  exerciseLibrary: WorkoutExercise[]
  search: string
  onSelectExercise: (
    exercise: WorkoutRoutineExercise,
  ) => void
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

export function TodayExerciseList({
  routine,
  exerciseLibrary,
  search,
  onSelectExercise,
}: TodayExerciseListProps) {
  const query =
    search.trim().toLowerCase()

  const exercises =
    (
      routine?.routine_exercises ??
      []
    )
      .slice()
      .sort(
        (a, b) =>
          a.order_index -
          b.order_index,
      )
      .map((item) => {
        const details =
          resolveWorkoutExercise(
            item.exercise_id,
            item.exercises,
            exerciseLibrary,
          )

        return {
          item,
          details,
          instructions:
            getExerciseInstructions(
              details,
            ),
        }
      })
      .filter(
        ({
          item,
          details,
          instructions,
        }) => {
          if (!query) return true

          return [
            details?.name,
            details?.category,
            details?.equipment,
            details?.difficulty,
            item.notes,
            ...instructions,
          ]
            .filter(
              (
                value,
              ): value is string =>
                typeof value ===
                'string' &&
                value.length > 0,
            )
            .some((value) =>
              value
                .toLowerCase()
                .includes(query),
            )
        },
      )

  const openExercise = (
    item: WorkoutRoutineExercise,
    details: WorkoutExercise | null,
  ) => {
    onSelectExercise({
      ...item,
      exercises: details,
    })
  }

  return (
    <section className="rounded-[24px] border border-[#EAE7EC] bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold tracking-[-0.02em] text-[#38323F]">
            Today&apos;s Exercises
          </h2>

          <p className="mt-1 text-xs text-[#8B8690]">
            {routine
              ? `${routine.name} · ${routine.routine_exercises.length} ${
                  routine
                    .routine_exercises
                    .length === 1
                    ? 'exercise'
                    : 'exercises'
                }`
              : 'No routine assigned today'}
          </p>
        </div>

        {exercises.length > 0 ? (
          <span className="rounded-xl bg-[#F3F4F7] px-3 py-2 text-xs font-bold text-[#7482A4]">
            {exercises.length}{' '}
            {exercises.length === 1
              ? 'Exercise'
              : 'Exercises'}
          </span>
        ) : (
          <span className="rounded-xl bg-[#F3F4F7] px-3 py-2 text-xs font-bold text-[#7482A4]">
            0 Exercises
          </span>
        )}
      </div>

      {exercises.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {exercises.map(
            (
              {
                item,
                details,
                instructions,
              },
              index,
            ) => {
              const name =
                details?.name ??
                'Exercise unavailable'

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    openExercise(
                      item,
                      details,
                    )
                  }
                  className="group grid w-full gap-4 rounded-2xl border border-[#EEEAF0] bg-[#FCFBFD] p-3 text-left transition hover:-translate-y-0.5 hover:border-[#7482A4]/25 hover:bg-white hover:shadow-[0_10px_24px_rgba(56,50,63,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] sm:grid-cols-[92px_minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="relative">
                    <WorkoutExerciseImage
                      imageUrl={
                        details?.image_url
                      }
                      name={name}
                      className="h-24 w-full rounded-xl sm:h-[82px] sm:w-[92px]"
                    />

                    <span className="absolute left-2 top-2 grid h-6 min-w-6 place-items-center rounded-lg bg-[#38323F]/80 px-1.5 text-[10px] font-extrabold text-white backdrop-blur-sm">
                      {index + 1}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="min-w-0 truncate text-sm font-extrabold text-[#38323F]">
                        {name}
                      </h3>

                      {details?.difficulty ? (
                        <span className="rounded-full bg-[#7482A4]/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#7482A4]">
                          {
                            details.difficulty
                          }
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-1 text-[11px] font-semibold text-[#817B85]">
                      {[
                        details?.category,
                        details?.equipment,
                      ]
                        .filter(Boolean)
                        .join(' · ') ||
                        'Exercise details unavailable'}
                    </p>

                    {instructions[0] ? (
                      <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#8B8690]">
                        {
                          instructions[0]
                        }
                      </p>
                    ) : item.notes ? (
                      <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#8B8690]">
                        {item.notes}
                      </p>
                    ) : (
                      <p className="mt-2 text-[11px] text-[#AAA5AF]">
                        Open exercise details
                        to view the full plan.
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-[#F2F3F7] px-2 py-1 text-[10px] font-bold text-[#5F5963]">
                        <Dumbbell className="h-3 w-3 text-[#7482A4]" />
                        {item.target_sets} ×{' '}
                        {
                          item.target_reps_min
                        }
                        –
                        {
                          item.target_reps_max
                        }
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-lg bg-[#F2F3F7] px-2 py-1 text-[10px] font-bold text-[#5F5963]">
                        <Timer className="h-3 w-3 text-[#7482A4]" />
                        {formatRest(
                          item.rest_seconds,
                        )}{' '}
                        rest
                      </span>
                    </div>
                  </div>

                  <div className="hidden items-center gap-4 sm:flex">
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-[#38323F]">
                        {item.target_sets} ×{' '}
                        {
                          item.target_reps_min
                        }
                        –
                        {
                          item.target_reps_max
                        }
                      </p>
                      <p className="mt-1 text-[10px] font-semibold text-[#8B8690]">
                        {formatRest(
                          item.rest_seconds,
                        )}{' '}
                        rest
                      </p>
                    </div>

                    <ChevronRight className="h-4 w-4 text-[#A6A0AA] transition group-hover:translate-x-0.5 group-hover:text-[#7482A4]" />
                  </div>
                </button>
              )
            },
          )}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-[#DCD8E1] bg-[#FAF9FB] px-5 py-10 text-center">
          <ClipboardList className="mx-auto h-8 w-8 text-[#7482A4]" />

          <p className="mt-3 text-sm font-extrabold text-[#38323F]">
            {search.trim()
              ? 'No matching exercises'
              : 'No exercises to show'}
          </p>

          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#8B8690]">
            {search.trim()
              ? 'Try another exercise, category, equipment, or instruction keyword.'
              : routine
                ? 'This routine currently has no exercise assignments.'
                : 'Assign a routine to today to see the complete exercise plan here.'}
          </p>
        </div>
      )}
    </section>
  )
}
