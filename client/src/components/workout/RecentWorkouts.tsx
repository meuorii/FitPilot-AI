import { useState } from 'react'
import {
  ChevronRight,
  History,
} from 'lucide-react'
import type { WorkoutHistoryItem } from '../../services/types/workout'
import { RecentWorkoutDetailsModal } from './modals/RecentWorkoutDetailsModal'

interface RecentWorkoutsProps {
  workouts: WorkoutHistoryItem[]
  search: string
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
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

export function RecentWorkouts({
  workouts,
  search,
}: RecentWorkoutsProps) {
  const [showAll, setShowAll] =
    useState(false)

  const [
    selectedWorkout,
    setSelectedWorkout,
  ] = useState<WorkoutHistoryItem | null>(
    null,
  )

  const query =
    search.trim().toLowerCase()

  const filtered = workouts.filter(
    (workout) => {
      if (!query) return true

      return (
        workout.workout_routines?.name ??
        'Workout'
      )
        .toLowerCase()
        .includes(query)
    },
  )

  const visible = showAll
    ? filtered
    : filtered.slice(0, 3)

  return (
    <>
      <section className="rounded-[24px] border border-[#EAE7EC] bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold tracking-[-0.02em] text-[#38323F]">
              Recent Workouts
            </h2>

            <p className="mt-1 text-xs text-[#8B8690]">
              Your latest completed sessions
            </p>
          </div>

          {filtered.length > 3 ? (
            <button
              type="button"
              onClick={() =>
                setShowAll(
                  (value) => !value,
                )
              }
              className="rounded-xl bg-[#F5F3F6] px-3 py-2 text-xs font-bold text-[#7482A4] transition hover:bg-[#ECE9EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
            >
              {showAll
                ? 'Show Less'
                : 'View All'}
            </button>
          ) : null}
        </div>

        {visible.length > 0 ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-[#EEEAF0]">
            {/* Desktop table header */}
            <div className="hidden grid-cols-[minmax(0,1fr)_130px_90px_90px_24px] gap-3 bg-[#FAF9FB] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8B8690] sm:grid">
              <span>Workout</span>
              <span>Date</span>
              <span>Sets</span>
              <span>Duration</span>
              <span />
            </div>

            <div className="divide-y divide-[#F0EDF2]">
              {visible.map((workout) => {
                const completedSets =
                  workout.workout_sets.filter(
                    (set) =>
                      set.is_completed,
                  ).length

                const workoutName =
                  workout.workout_routines
                    ?.name ?? 'Workout'

                return (
                  <button
                    key={workout.id}
                    type="button"
                    onClick={() =>
                      setSelectedWorkout(
                        workout,
                      )
                    }
                    aria-label={`View details for ${workoutName}`}
                    className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 bg-white px-4 py-3 text-left transition hover:bg-[#FAF9FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7482A4] sm:grid-cols-[minmax(0,1fr)_130px_90px_90px_24px]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#38323F] transition group-hover:text-[#7482A4]">
                        {workoutName}
                      </p>

                      <p className="mt-0.5 text-[11px] text-[#9A949E] sm:hidden">
                        {formatDate(
                          workout.workout_date,
                        )}{' '}
                        · {completedSets} sets ·{' '}
                        {formatDuration(
                          workout.started_at,
                          workout.completed_at,
                        )}
                      </p>
                    </div>

                    <span className="hidden text-xs text-[#5F5963] sm:block">
                      {formatDate(
                        workout.workout_date,
                      )}
                    </span>

                    <span className="hidden text-xs text-[#5F5963] sm:block">
                      {completedSets} sets
                    </span>

                    <span className="hidden text-xs text-[#5F5963] sm:block">
                      {formatDuration(
                        workout.started_at,
                        workout.completed_at,
                      )}
                    </span>

                    <span className="grid h-7 w-7 place-items-center rounded-lg text-[#A6A0AA] transition group-hover:bg-[#F5F3F6] group-hover:text-[#7482A4]">
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-[#DCD8E1] bg-[#FAF9FB] px-5 py-9 text-center">
            <History className="mx-auto h-8 w-8 text-[#7482A4]" />

            <p className="mt-3 text-sm font-extrabold text-[#38323F]">
              {search.trim()
                ? 'No matching workouts'
                : 'No workout history yet'}
            </p>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#8B8690]">
              {search.trim()
                ? 'Try another search term.'
                : 'Complete your first workout and it will appear here.'}
            </p>
          </div>
        )}
      </section>

      <RecentWorkoutDetailsModal
        open={Boolean(selectedWorkout)}
        workout={selectedWorkout}
        onClose={() =>
          setSelectedWorkout(null)
        }
      />
    </>
  )
}