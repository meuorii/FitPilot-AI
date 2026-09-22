export interface ProgressApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data: T;
}

export interface ProgressMessageResponse {
  success: boolean;
  message: string;
  error?: string;
}

// -----------------------------------------------------------------------------
// Progress Goal
// -----------------------------------------------------------------------------

export interface ProgressGoalSummary {
  primary_goal: string;
  current_weight_kg: number | null;
  target_weight_kg: number | null;
  starting_weight_kg: number | null;
  weight_change_kg: number | null;
  remaining_kg: number | null;
  progress_percentage: number | null;
}

// -----------------------------------------------------------------------------
// Progress Logs / Check-ins
// -----------------------------------------------------------------------------

export interface ProgressLog {
  id: string;
  weight_kg: number | null;
  body_fat_percentage: number | null;
  photo_url: string | null;
  photo_tag: string | null;
  logged_at: string;
}

export interface CreateProgressLogInput {
  weight_kg?: number;
  body_fat_percentage?: number;
  photo_url?: string;
  photo_tag?: string;
  logged_at?: string;
}

export interface ProgressLogsQuery {
  limit?: number;
  offset?: number;
}

export interface ProgressPagination {
  limit: number;
  offset: number;
  total: number;
  has_more: boolean;
}

export interface ProgressLogsData {
  logs: ProgressLog[];
  pagination: ProgressPagination;
}

// -----------------------------------------------------------------------------
// Trends
// -----------------------------------------------------------------------------

export interface WeightTrendPoint {
  id: string;
  weight_kg: number | null;
  logged_at: string;
}

export interface BodyFatTrendPoint {
  id: string;
  body_fat_percentage: number | null;
  logged_at: string;
}

// -----------------------------------------------------------------------------
// Training Summary
// -----------------------------------------------------------------------------

export interface ProgressTrainingSummary {
  completed_workouts: number;
  workouts_this_week: number;
  workout_days_goal: number;
  total_volume_kg: number;
  average_volume_kg: number;
}

// -----------------------------------------------------------------------------
// Overview
// -----------------------------------------------------------------------------

export interface ProgressOverviewMeta {
  trend_days: number;
  week_start: string;
  today: string;
}

export interface ProgressOverviewData {
  goal: ProgressGoalSummary;
  latest_check_in: ProgressLog | null;
  weight_trend: WeightTrendPoint[];
  body_fat_trend: BodyFatTrendPoint[];
  training: ProgressTrainingSummary;
  meta: ProgressOverviewMeta;
}

// -----------------------------------------------------------------------------
// API Responses
// -----------------------------------------------------------------------------

export type ProgressOverviewResponse =
  ProgressApiResponse<ProgressOverviewData>;

export type ProgressLogsResponse =
  ProgressApiResponse<ProgressLogsData>;

export type CreateProgressLogResponse =
  ProgressApiResponse<ProgressLog>;

export type DeleteProgressLogResponse =
  ProgressMessageResponse;
