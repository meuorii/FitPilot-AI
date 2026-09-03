export type PrimaryGoal =
  | 'lose_weight'
  | 'lose_fat'
  | 'maintain'
  | 'gain_muscle';

export interface DashboardUser {
  full_name: string;
  avatar_url: string | null;
  primary_goal: PrimaryGoal;
  streak_count: number;
  workout_days_per_week: number;
  is_onboarded: boolean;
}

export interface NutritionProgress {
  consumed: number;
  target: number;
  remaining: number;
  exceeded: number;
  percentage: number;
}

export interface DashboardNutrition {
  calories: NutritionProgress;
  protein: NutritionProgress;
  carbs: NutritionProgress;
  fat: NutritionProgress;
  meals_logged: number;
}

// Replace these placeholder records once the API returns populated examples.
export type DashboardMeal = Record<string, unknown>;
export type DashboardWorkout = Record<string, unknown>;
export type DashboardWorkoutSession = Record<string, unknown>;

export interface DashboardToday {
  date: string;
  nutrition: DashboardNutrition;
  meals: DashboardMeal[];
  workout: DashboardWorkout | null;
  workout_sessions: DashboardWorkoutSession[];
}

export interface WeeklyWorkoutProgress {
  completed: number;
  target: number;
}

export interface DashboardActivityDay {
  date: string;
  day: string;
  workouts: number;
  sets_completed: number;
  total_volume_kg: number;
}

export interface DashboardWeek {
  start_date: string;
  end_date: string;
  workouts: WeeklyWorkoutProgress;
  activity: DashboardActivityDay[];
}

export interface DashboardCalendar {
  year: number;
  month: number;
  workout_dates: string[];
  meal_log_dates: string[];
}

export interface CoachCheckinAction {
  label: string;
  route: string;
}

export interface DashboardCoachCheckin {
  type: string;
  title: string;
  message: string;
  suggestion: string;
  action: CoachCheckinAction;
}

export interface DashboardSummaryData {
  user: DashboardUser;
  today: DashboardToday;
  week: DashboardWeek;
  calendar: DashboardCalendar;
  coach_checkin: DashboardCoachCheckin;
}

export interface DashboardSummaryResponse {
  success: boolean;
  message: string;
  data: DashboardSummaryData;
}