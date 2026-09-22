import type { DashboardResponse } from "../services/types/dashboard";

/** Development-only fixture matching the requested zero/empty dashboard state. */
export const emptyDashboardFixture: DashboardResponse = {
  success: true,
  message: "Dashboard data retrieved successfully.",
  data: {
    user: {
      full_name: "Kian Fontillas",
      avatar_url: null,
      primary_goal: "lose_fat",
      streak_count: 0,
      workout_days_per_week: 4,
      is_onboarded: true,
    },
    today: {
      date: "2026-09-19",
      nutrition: {
        calories: { consumed: 0, target: 2274, remaining: 2274, exceeded: 0, percentage: 0 },
        protein: { consumed: 0, target: 176, remaining: 176, exceeded: 0, percentage: 0 },
        carbs: { consumed: 0, target: 251, remaining: 251, exceeded: 0, percentage: 0 },
        fat: { consumed: 0, target: 63, remaining: 63, exceeded: 0, percentage: 0 },
        meals_logged: 0,
      },
      meals: [],
      workout: null,
      workout_sessions: [],
    },
    week: {
      start_date: "2026-09-14",
      end_date: "2026-09-20",
      workouts: { completed: 0, target: 4, percentage: 0 },
      activity: [
        { date: "2026-09-14", day: "Monday", workouts: 0, sets_completed: 0, total_volume_kg: 0 },
        { date: "2026-09-15", day: "Tuesday", workouts: 0, sets_completed: 0, total_volume_kg: 0 },
        { date: "2026-09-16", day: "Wednesday", workouts: 0, sets_completed: 0, total_volume_kg: 0 },
        { date: "2026-09-17", day: "Thursday", workouts: 0, sets_completed: 0, total_volume_kg: 0 },
        { date: "2026-09-18", day: "Friday", workouts: 0, sets_completed: 0, total_volume_kg: 0 },
        { date: "2026-09-19", day: "Saturday", workouts: 0, sets_completed: 0, total_volume_kg: 0 },
        { date: "2026-09-20", day: "Sunday", workouts: 0, sets_completed: 0, total_volume_kg: 0 },
      ],
    },
    calendar: {
      year: 2026,
      month: 9,
      workout_dates: [],
      meal_log_dates: [],
    },
    today_summary: {
      meals_logged: 0,
      calories_consumed: 0,
      calories_remaining: 2274,
      protein_consumed: 0,
      protein_remaining: 176,
      workouts_completed: 0,
      workouts_started: 0,
      sets_completed: 0,
      total_volume_kg: 0,
    },
  },
};
