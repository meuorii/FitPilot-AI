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
    <div className="dashboard-dashboard">
      <div className="dashboard-dashboard__overview">
        <DashboardHero nutrition={data.today.nutrition} />
        <NutritionOverview nutrition={data.today.nutrition} />
      </div>

      <div className="dashboard-dashboard__grid">
        <div className="dashboard-dashboard__calendar">
          <DashboardCalendar calendar={data.calendar} today={data.today.date} />
        </div>

        <div className="dashboard-dashboard__activity">
          <WeeklyActivityCard week={data.week} />
        </div>

        <div className="dashboard-dashboard__plan">
          <TodayPlanCard today={data.today} />
        </div>

        <div className="dashboard-dashboard__workout">
          <TodayWorkoutCard workout={data.today.workout} />
        </div>

        <div className="dashboard-dashboard__summary">
          <TodaySummaryCard summary={data.today_summary} />
        </div>
      </div>
    </div>
  );
}
