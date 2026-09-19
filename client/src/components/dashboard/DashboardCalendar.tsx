import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DashboardCalendar as DashboardCalendarData } from "../../services/types/dashboard";

interface DashboardCalendarProps {
  calendar: DashboardCalendarData;
  today: string;
}

const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function DashboardCalendar({ calendar, today }: DashboardCalendarProps) {
  const firstDay = new Date(calendar.year, calendar.month - 1, 1).getDay();
  const daysInMonth = new Date(calendar.year, calendar.month, 0).getDate();
  const monthName = new Date(calendar.year, calendar.month - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const workoutDates = new Set(calendar.workout_dates);
  const mealDates = new Set(calendar.meal_log_dates);
  const cells: Array<number | null> = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <section className="rounded-[24px] border border-[#EAE7EC] bg-white p-5 shadow-[0_8px_30px_rgba(56,50,63,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-[#38323F]">Calendar</h2>
          <p className="mt-1 text-xs font-semibold text-[#8A858F]">{monthName}</p>
        </div>
        <div className="flex gap-1">
          <button type="button" aria-label="Previous month" className="grid h-8 w-8 place-items-center rounded-xl bg-[#F5F3F6] text-[#77727B]">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Next month" className="grid h-8 w-8 place-items-center rounded-xl bg-[#F5F3F6] text-[#77727B]">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1 text-center">
        {weekDays.map((day) => (
          <div key={day} className="pb-2 text-[10px] font-extrabold uppercase tracking-wide text-[#A09BA5]">{day}</div>
        ))}

        {cells.map((day, index) => {
          if (day === null) return <div key={`blank-${index}`} className="aspect-square" />;
          const iso = toIsoDate(calendar.year, calendar.month, day);
          const isToday = iso === today;
          const hasWorkout = workoutDates.has(iso);
          const hasMeal = mealDates.has(iso);

          return (
            <div key={iso} className="relative grid aspect-square place-items-center">
              <div
                className={[
                  "grid h-8 w-8 place-items-center rounded-xl text-xs font-bold",
                  isToday ? "bg-[#7482A4] text-white" : "text-[#5F5A64]",
                ].join(" ")}
              >
                {day}
              </div>
              {(hasWorkout || hasMeal) && (
                <div className="absolute bottom-0 flex items-center gap-0.5" aria-label={`${hasWorkout ? "Workout logged" : ""}${hasWorkout && hasMeal ? " and " : ""}${hasMeal ? "meal logged" : ""}`}>
                  {hasWorkout && <span className="h-1.5 w-1.5 rounded-full bg-[#7482A4]" />}
                  {hasMeal && <span className="h-1.5 w-1.5 rounded-full bg-[#B6A2B6]" />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-[11px] font-semibold text-[#8A858F]">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#7482A4]" /> Workout</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#B6A2B6]" /> Meal log</span>
      </div>
    </section>
  );
}
