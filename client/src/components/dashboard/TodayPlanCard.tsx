import { Apple, ChevronRight, Dumbbell, Flame, Goal } from "lucide-react";
import { Link } from "react-router-dom";
import type { DashboardToday } from "../../services/types/dashboard";

interface TodayPlanCardProps {
  today: DashboardToday;
}

export function TodayPlanCard({ today }: TodayPlanCardProps) {
  const rows = [
    {
      label: "Workout",
      value: today.workout ? today.workout.routine_name : "No workout started yet",
      to: "/workouts",
      icon: Dumbbell,
    },
    {
      label: "Log Meals",
      value: today.nutrition.meals_logged > 0 ? `${today.nutrition.meals_logged} meal(s) logged` : "No meals logged yet",
      to: "/meals",
      icon: Apple,
    },
    {
      label: "Protein Goal",
      value: `${today.nutrition.protein.consumed}g / ${today.nutrition.protein.target}g`,
      to: "/meals",
      icon: Goal,
    },
    {
      label: "Calories Left",
      value: today.nutrition.calories.exceeded > 0
        ? `${today.nutrition.calories.exceeded} kcal over target`
        : `${Math.max(0, today.nutrition.calories.remaining)} kcal remaining`,
      to: "/meals",
      icon: Flame,
    },
  ];

  return (
    <section className="rounded-[24px] border border-[#EAE7EC] bg-white p-5 shadow-[0_8px_30px_rgba(56,50,63,0.04)]">
      <h2 className="text-lg font-extrabold text-[#38323F]">Today&apos;s Plan</h2>
      <p className="mt-1 text-xs text-[#8A858F]">Quick actions based on your current dashboard data.</p>

      <div className="mt-4 divide-y divide-[#EFEDF0]">
        {rows.map(({ label, value, to, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="flex items-center gap-3 py-3.5 outline-none transition hover:translate-x-0.5 focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F5F3F6] text-[#7482A4]">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-[#918C96]">{label}</span>
              <span className="mt-0.5 block truncate text-sm font-extrabold text-[#38323F]">{value}</span>
            </span>
            <ChevronRight className="h-4 w-4 text-[#B3AFB7]" />
          </Link>
        ))}
      </div>
    </section>
  );
}
