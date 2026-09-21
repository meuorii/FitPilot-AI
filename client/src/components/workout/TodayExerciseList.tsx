import { ChevronRight, ClipboardList } from 'lucide-react'
import type {
  WorkoutRoutine,
  WorkoutRoutineExercise,
} from '../../services/types/workout'

interface TodayExerciseListProps {
  routine: WorkoutRoutine | null
  search: string
  onSelectExercise: (exercise: WorkoutRoutineExercise) => void
}

const formatRest = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${minutes}:${remaining.toString().padStart(2, '0')}`
}

export function TodayExerciseList({
  routine,
  search,
  onSelectExercise,
}: TodayExerciseListProps) {
  const query = search.trim().toLowerCase()
  const exercises = (routine?.routine_exercises ?? [])
    .slice()
    .sort((a, b) => a.order_index - b.order_index)
    .filter((item) => {
      if (!query) return true
      const exercise = item.exercises
      return [exercise?.name, exercise?.category, exercise?.equipment]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(query))
    })

  return (
    <section className="rounded-[24px] border border-[#EAE7EC] bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold tracking-[-0.02em] text-[#38323F]">
            Today&apos;s Exercise List
          </h2>
          <p className="mt-1 text-xs text-[#8B8690]">
            {routine ? routine.name : 'No routine assigned today'}
          </p>
        </div>
        {exercises.length > 0 ? (
          <button
            type="button"
            onClick={() => onSelectExercise(exercises[0])}
            className="rounded-xl bg-[#F3F4F7] px-3 py-2 text-xs font-bold text-[#7482A4] transition hover:bg-[#E9EBF0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            View Exercise Details
          </button>
        ) : (
          <span className="rounded-xl bg-[#F3F4F7] px-3 py-2 text-xs font-bold text-[#7482A4]">
            0 Exercises
          </span>
        )}
      </div>

      {exercises.length > 0 ? (
        <div className="mt-5 overflow-hidden rounded-2xl border border-[#EEEAF0]">
          <div className="hidden grid-cols-[48px_minmax(0,1fr)_120px_80px_36px] items-center gap-3 bg-[#FAF9FB] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8B8690] sm:grid">
            <span>#</span>
            <span>Exercise</span>
            <span>Sets × Reps</span>
            <span>Rest</span>
            <span />
          </div>

          <div className="divide-y divide-[#F0EDF2]">
            {exercises.map((item, index) => {
              const exercise = item.exercises
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectExercise(item)}
                  className="grid w-full grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left transition hover:bg-[#F8F8FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7482A4] sm:grid-cols-[48px_minmax(0,1fr)_120px_80px_36px]"
                >
                  <span className="text-xs font-extrabold text-[#7482A4]">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-[#38323F]">
                      {exercise?.name ?? 'Exercise unavailable'}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-[#9A949E] sm:hidden">
                      {item.target_sets} × {item.target_reps_min}–{item.target_reps_max} · {formatRest(item.rest_seconds)} rest
                    </span>
                  </span>
                  <span className="hidden text-xs font-semibold text-[#5F5963] sm:block">
                    {item.target_sets} × {item.target_reps_min}–{item.target_reps_max}
                  </span>
                  <span className="hidden text-xs font-semibold text-[#5F5963] sm:block">
                    {formatRest(item.rest_seconds)}
                  </span>
                  <ChevronRight className="h-4 w-4 justify-self-end text-[#A6A0AA]" />
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-[#DCD8E1] bg-[#FAF9FB] px-5 py-10 text-center">
          <ClipboardList className="mx-auto h-8 w-8 text-[#7482A4]" />
          <p className="mt-3 text-sm font-extrabold text-[#38323F]">
            {search.trim() ? 'No matching exercises' : 'No exercises to show'}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#8B8690]">
            {search.trim()
              ? 'Try a different workout or exercise search.'
              : routine
                ? 'This routine does not have exercises yet.'
                : 'Assign a routine to today to see its exercise plan here.'}
          </p>
        </div>
      )}
    </section>
  )
}
