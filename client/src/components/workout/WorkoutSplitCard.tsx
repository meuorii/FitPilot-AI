import { CalendarDays, Dumbbell, Plus } from 'lucide-react'
import type { WorkoutSplit } from '../../services/types/workout'

interface WorkoutSplitCardProps {
  split: WorkoutSplit | null
  todayDayOfWeek: number
  onChangeSplit: () => void
  onCreateSplit: () => void
}

const days = [
  { index: 1, label: 'Mon' },
  { index: 2, label: 'Tue' },
  { index: 3, label: 'Wed' },
  { index: 4, label: 'Thu' },
  { index: 5, label: 'Fri' },
  { index: 6, label: 'Sat' },
  { index: 0, label: 'Sun' },
]

export function WorkoutSplitCard({
  split,
  todayDayOfWeek,
  onChangeSplit,
  onCreateSplit,
}: WorkoutSplitCardProps) {
  return (
    <section className="rounded-[24px] border border-[#EAE7EC] bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-extrabold tracking-[-0.02em] text-[#38323F]">
            My Workout Split
          </p>
          <p className="mt-1 text-xs text-[#8B8690]">Your weekly training rhythm</p>
        </div>
        {split ? (
          <button
            type="button"
            onClick={onChangeSplit}
            className="rounded-xl bg-[#F2F3F7] px-3 py-2 text-xs font-bold text-[#7482A4] transition hover:bg-[#E9EBF0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            Change Split
          </button>
        ) : null}
      </div>

      {split ? (
        <>
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#F7F6F8] p-3.5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-[#7482A4] shadow-sm">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-[#38323F]">
                {split.name}
              </p>
              <p className="mt-0.5 line-clamp-1 text-xs text-[#8B8690]">
                {split.description || 'Your active weekly workout split.'}
              </p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-[#F0EDF2]">
            {days.map((day) => {
              const splitDay = split.days.find(
                (item) => item.day_of_week === day.index
              )
              const isToday = day.index === todayDayOfWeek
              const isRest = !splitDay || splitDay.is_rest_day || !splitDay.routine

              return (
                <div
                  key={day.index}
                  className="grid min-h-10 grid-cols-[42px_14px_1fr_auto] items-center gap-2 text-xs"
                >
                  <span className="font-bold text-[#5F5963]">{day.label}</span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isRest ? 'bg-[#C9C5CE]' : 'bg-[#7482A4]'
                    }`}
                    aria-label={isRest ? 'Rest day' : 'Workout day'}
                  />
                  <span
                    className={`truncate font-semibold ${
                      isRest ? 'text-[#AAA5AE]' : 'text-[#38323F]'
                    }`}
                  >
                    {isRest ? 'Rest' : splitDay.routine?.name}
                  </span>
                  {isToday ? (
                    <span className="rounded-full bg-[#7482A4] px-2.5 py-1 text-[10px] font-extrabold text-white">
                      Today
                    </span>
                  ) : null}
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-[#DCD8E1] bg-[#FAF9FB] px-5 py-8 text-center">
          <CalendarDays className="mx-auto h-7 w-7 text-[#7482A4]" />
          <p className="mt-3 text-sm font-extrabold text-[#38323F]">
            No workout split yet
          </p>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[#8B8690]">
            Create a weekly split to assign routines to your training days.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onCreateSplit}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#CBD0DC] px-4 py-3 text-xs font-extrabold text-[#7482A4] transition hover:bg-[#F3F4F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
      >
        <Plus className="h-4 w-4" />
        Create New Split
      </button>
    </section>
  )
}
