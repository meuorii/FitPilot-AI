export type SettingsUnitSystem =
  | 'metric'
  | 'imperial';

export type SettingsActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active';

export type SettingsFitnessExperience =
  | 'beginner'
  | 'intermediate'
  | 'advanced';

export type SettingsPrimaryGoal =
  | 'lose_weight'
  | 'lose_fat'
  | 'maintain'
  | 'maintain_weight'
  | 'gain_muscle';

// -----------------------------------------------------------------------------
// Settings response
// -----------------------------------------------------------------------------

export interface SettingsAccount {
  id: string;
  email: string;
  email_verified: boolean;
  full_name: string;
  avatar_url: string | null;
}

export interface SettingsProfile {
  age: number | null;
  gender: string | null;
  height_cm: number | null;
  current_weight_kg: number | null;
  activity_level: string | null;
  fitness_experience: string | null;
  unit_system: string | null;
}

export interface SettingsGoals {
  primary_goal: string | null;
  target_weight_kg: number | null;
  daily_calories: number | null;
  protein_grams: number | null;
  carbs_grams: number | null;
  fat_grams: number | null;
}

export interface SettingsWorkout {
  workout_days_per_week: number | null;
}

export interface SettingsMeta {
  streak_count: number;
  is_onboarded: boolean;
  updated_at: string | null;
}

export interface SettingsData {
  account: SettingsAccount;
  profile: SettingsProfile;
  goals: SettingsGoals;
  workout: SettingsWorkout;
  meta: SettingsMeta;
}

// -----------------------------------------------------------------------------
// Update payloads
// -----------------------------------------------------------------------------

export interface UpdateProfileSettingsInput {
  full_name?: string;
  avatar_url?: string | null;
  age?: number;
  gender?: string;
  height_cm?: number;
  current_weight_kg?: number;
}

export interface UpdateGoalSettingsInput {
  primary_goal?: SettingsPrimaryGoal;
  target_weight_kg?: number | null;
  daily_calories?: number;
  protein_grams?: number;
  carbs_grams?: number;
  fat_grams?: number;
}

export interface UpdatePreferenceSettingsInput {
  activity_level?: SettingsActivityLevel;
  fitness_experience?: SettingsFitnessExperience;
  unit_system?: SettingsUnitSystem;
  workout_days_per_week?: number;
}

export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
}

export interface UploadSettingsAvatarInput {
  file: File;
}

// -----------------------------------------------------------------------------
// API responses
// -----------------------------------------------------------------------------

export interface SettingsResponse {
  success: true;
  data: SettingsData;
}

export interface SettingsUpdateResponse {
  success: true;
  message: string;
  data: SettingsData;
}

export interface SettingsMessageResponse {
  success: true;
  message: string;
}

export type SettingsAvatarUpdateResponse =
  SettingsUpdateResponse;

export interface SettingsErrorResponse {
  success: false;
  error: string;
}