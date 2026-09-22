export type CoachChatRole = 'user' | 'assistant';

export interface CoachChatMessage {
  role: CoachChatRole;
  content: string;
}

export interface CoachChatRequest {
  message: string;
  history?: CoachChatMessage[];
}

export interface CoachChatResponse {
  reply: string;
}

export interface CoachChatErrorResponse {
  error: string;
}

// -----------------------------------------------------------------------------
// Coach Context
// -----------------------------------------------------------------------------

export type CoachWorkoutStatus =
  | 'no_split'
  | 'not_scheduled'
  | 'rest_day'
  | 'not_started'
  | 'in_progress'
  | 'completed';

export interface CoachNutritionMetric {
  consumed: number;
  target: number;
  remaining: number;
  percentage: number;
}

export interface CoachContextUser {
  full_name: string;
  fitness_experience: string | null;
}

export interface CoachContextGoals {
  primary_goal: string;
  primary_goal_label: string;
  current_weight_kg: number | null;
  target_weight_kg: number | null;
}

export interface CoachContextNutrition {
  calories: CoachNutritionMetric;
  protein: CoachNutritionMetric;
  carbs: CoachNutritionMetric;
  fat: CoachNutritionMetric;
}

export interface CoachWorkoutSplit {
  id: string;
  name: string;
  description: string | null;
}

export interface CoachTodayWorkout {
  day_of_week: number;
  day_label: string;
  scheduled: boolean;
  split_day_id: string | null;
  routine_id: string | null;
  routine_name: string | null;
  is_rest_day: boolean;
}

export interface CoachWorkoutSession {
  routine_name: string;
  status: string;
  total_volume_kg: number;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface CoachWorkoutContext {
  split: CoachWorkoutSplit | null;
  today: CoachTodayWorkout;
  status: CoachWorkoutStatus;
  label: string;
  sessions: CoachWorkoutSession[];
}

export interface CoachContextData {
  user: CoachContextUser;
  goals: CoachContextGoals;
  nutrition: CoachContextNutrition;
  workout: CoachWorkoutContext;
}

export interface CoachContextResponse {
  success: true;
  data: CoachContextData;
}

export interface CoachContextErrorResponse {
  success: false;
  error: string;
}