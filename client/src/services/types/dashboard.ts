export interface DashboardMetric {
  consumed: number;
  target: number;
  remaining: number;
  exceeded: number;
  percentage: number;
}

export interface DashboardNutrition {
  calories: DashboardMetric;
  protein: DashboardMetric;
  carbs: DashboardMetric;
  fat: DashboardMetric;
  meals_logged: number;
}

export interface DashboardMeal {
  id: string | number;
  name?: string | null;
  meal_type?: string | null;
  calories?: number | null;
  logged_at?: string | null;
}

export type DashboardWorkoutStatus =
  | "started"
  | "in_progress"
  | "completed"
  | "cancelled"
  | string;

export interface DashboardWorkout {
  id: string | number;
  routine_id?: string | number | null;
  routine_name: string;
  status: DashboardWorkoutStatus;
  exercises_completed: number;
  total_exercises: number;
  sets_completed: number;
  total_sets: number;
  total_volume_kg: number;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface DashboardWeekActivity {
  date: string;
  day: string;
  workouts: number;
  sets_completed: number;
  total_volume_kg: number;
}

export interface DashboardWeekWorkouts {
  completed: number;
  target: number;
  percentage?: number;
}

export interface DashboardWeek {
  start_date: string;
  end_date: string;
  workouts: DashboardWeekWorkouts;
  activity: DashboardWeekActivity[];
}

export interface DashboardCalendar {
  year: number;
  month: number;
  workout_dates: string[];
  meal_log_dates: string[];
}

export interface DashboardTodaySummary {
  meals_logged: number;
  calories_consumed: number;
  calories_remaining: number;
  protein_consumed: number;
  protein_remaining: number;
  workouts_completed: number;
  workouts_started: number;
  sets_completed: number;
  total_volume_kg: number;
}

export interface DashboardUser {
  full_name: string;
  avatar_url: string | null;
  primary_goal: string;
  streak_count: number;
  workout_days_per_week: number;
  is_onboarded: boolean;
}

export interface DashboardToday {
  date: string;
  nutrition: DashboardNutrition;
  meals: DashboardMeal[];
  workout: DashboardWorkout | null;
  workout_sessions: DashboardWorkout[];
}

export interface DashboardData {
  user: DashboardUser;
  today: DashboardToday;
  week: DashboardWeek;
  calendar: DashboardCalendar;
  today_summary: DashboardTodaySummary;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}
