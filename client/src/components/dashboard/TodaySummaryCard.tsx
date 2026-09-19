import type { DashboardTodaySummary } from "../../services/types/dashboard";

interface TodaySummaryCardProps {
  summary: DashboardTodaySummary;
}

export function TodaySummaryCard({ summary }: TodaySummaryCardProps) {
  const primary = [
    ["Meals Logged", summary.meals_logged.toLocaleString()],
    ["Calories Consumed", `${summary.calories_consumed.toLocaleString()} kcal`],
    ["Calories Remaining", `${summary.calories_remaining.toLocaleString()} kcal`],
    ["Protein Remaining", `${summary.protein_remaining.toLocaleString()} g`],
  ];

  const secondary = [
    ["Protein Consumed", `${summary.protein_consumed.toLocaleString()} g`],
    ["Workouts Completed", summary.workouts_completed.toLocaleString()],
    ["Workouts Started", summary.workouts_started.toLocaleString()],
    ["Sets Completed", summary.sets_completed.toLocaleString()],
    ["Total Volume", `${summary.total_volume_kg.toLocaleString()} kg`],
  ];

  return (
    <section className="rounded-[24px] border border-[#EAE7EC] bg-white p-5 shadow-[0_8px_30px_rgba(56,50,63,0.04)]">
      <h2 className="text-lg font-extrabold text-[#38323F]">Today&apos;s Summary</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {primary.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-[#F8F7F9] p-3">
            <p className="text-[11px] font-semibold text-[#918C96]">{label}</p>
            <p className="mt-1 text-sm font-extrabold text-[#38323F]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2.5 border-t border-[#EFEDF0] pt-4">
        {secondary.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 text-xs">
            <span className="font-semibold text-[#8A858F]">{label}</span>
            <span className="font-extrabold text-[#514B55]">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
