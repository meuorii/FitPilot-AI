import type { DashboardWeek, DashboardWeekActivity } from "../../services/types/dashboard";

interface WeeklyActivityCardProps {
  week: DashboardWeek;
}

function shortDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function normalizeSevenDays(week: DashboardWeek): DashboardWeekActivity[] {
  const start = new Date(`${week.start_date}T00:00:00`);
  if (Number.isNaN(start.getTime())) return week.activity;

  const byDate = new Map(week.activity.map((item) => [item.date, item]));

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const existing = byDate.get(iso);
    if (existing) return existing;

    return {
      date: iso,
      day: date.toLocaleDateString(undefined, { weekday: "long" }),
      workouts: 0,
      sets_completed: 0,
      total_volume_kg: 0,
    };
  });
}

export function WeeklyActivityCard({ week }: WeeklyActivityCardProps) {
  const activity = normalizeSevenDays(week);
  const maxSets = Math.max(1, ...activity.map((item) => item.sets_completed));
  const workoutProgress = Math.min(
    100,
    week.workouts.target > 0
      ? (week.workouts.completed / week.workouts.target) * 100
      : 0,
  );

  return (
    <section className="rounded-[24px] border border-[#EAE7EC] bg-white p-5 shadow-[0_8px_30px_rgba(56,50,63,0.04)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-[#38323F]">Weekly Activity</h2>
          <p className="mt-1 text-xs text-[#8A858F]">
            {shortDate(week.start_date)} – {shortDate(week.end_date)}
          </p>
        </div>
        <p className="text-sm font-extrabold text-[#5F6985]">
          {week.workouts.completed} / {week.workouts.target} workouts
        </p>
      </div>

      <div className="mt-6 grid h-44 grid-cols-7 items-end gap-2" aria-label="Weekly sets completed chart">
        {activity.map((item) => {
          const height = item.sets_completed === 0 ? 4 : Math.max(12, (item.sets_completed / maxSets) * 100);
          return (
            <div key={item.date} className="group flex h-full min-w-0 flex-col items-center justify-end gap-2">
              <div className="relative flex h-[120px] w-full items-end justify-center">
                <div
                  title={`${item.day}: ${item.sets_completed} sets, ${item.workouts} workout(s), ${item.total_volume_kg.toLocaleString()} kg volume`}
                  className="w-full max-w-8 rounded-t-lg bg-[#7482A4] transition-all group-hover:opacity-80"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="truncate text-[11px] font-bold text-[#8D8892]">{item.day.slice(0, 3)}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#EEECEF]" aria-label="Weekly workout goal progress">
        <div className="h-full rounded-full bg-[#7482A4]" style={{ width: `${workoutProgress}%` }} />
      </div>
      <p className="mt-2 text-xs text-[#8A858F]">
        Future days remain neutral until activity is actually logged.
      </p>
    </section>
  );
}
