import type { DashboardData } from "../../services/types/dashboard";
import { DashboardCalendar } from "./DashboardCalendar";
import { DashboardHero } from "./DashboardHero";
import { NutritionOverview } from "./NutritionOverview";
import { TodayPlanCard } from "./TodayPlanCard";
import { TodaySummaryCard } from "./TodaySummaryCard";
import { TodayWorkoutCard } from "./TodayWorkoutCard";
import { WeeklyActivityCard } from "./WeeklyActivityCard";

interface DashboardContentProps {
  data: DashboardData;
}

export function DashboardContent({ data }: DashboardContentProps) {
  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-5">
        <DashboardHero nutrition={data.today.nutrition} />
        <NutritionOverview nutrition={data.today.nutrition} />
        <div className="grid gap-5 xl:grid-cols-2">
          <TodayWorkoutCard workout={data.today.workout} />
          <WeeklyActivityCard week={data.week} />
        </div>
      </div>

      <aside className="grid min-w-0 gap-5 md:grid-cols-2 2xl:grid-cols-1 2xl:self-start">
        <DashboardCalendar calendar={data.calendar} today={data.today.date} />
        <TodayPlanCard today={data.today} />
        <div className="md:col-span-2 2xl:col-span-1">
          <TodaySummaryCard summary={data.today_summary} />
        </div>
      </aside>
    </div>
  );
}
