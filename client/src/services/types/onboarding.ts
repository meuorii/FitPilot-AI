export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
export type PrimaryGoal = 'lose_weight' | 'lose_fat' | 'maintain' | 'gain_muscle';
export type FitnessExperience = 'beginner' | 'intermediate' | 'advanced';
export type UnitSystem = 'metric' | 'imperial';

export interface ApiSuccessResponse<T> { success: true; message: string; data: T; }
export interface ApiErrorResponse { success: false; message: string; errors?: unknown; }

export interface CalculateGoalsRequest { age: number; gender: Gender; height_cm: number; weight_kg: number; activity_level: ActivityLevel; }
export interface GoalMetrics { bmi: number; bmi_category: string; bmr: number; tdee: number; daily_calories: number; protein_grams: number; carbs_grams: number; fat_grams: number; }
export interface GoalOption { goal: PrimaryGoal; label: string; is_recommended: boolean; recommendation_reason: string; recommended_target_weight_kg: number; metrics: GoalMetrics; }
export type CalculateGoalsResponse = ApiSuccessResponse<GoalOption[]>;

export interface CompleteOnboardingRequest { age: number; gender: Gender; height_cm: number; current_weight_kg: number; target_weight_kg: number; activity_level: ActivityLevel; primary_goal: PrimaryGoal; is_onboarded: true; }

export interface Profile {
  id: string; email: string; full_name: string; avatar_url: string | null; age: number; gender: Gender;
  height_cm: number; current_weight_kg: number; activity_level: ActivityLevel; fitness_experience: FitnessExperience;
  unit_system: UnitSystem; primary_goal: PrimaryGoal; target_weight_kg: number; daily_calories: number;
  protein_grams: number; carbs_grams: number; fat_grams: number; workout_days_per_week: number;
  is_onboarded: boolean; email_verified: boolean; created_at: string; updated_at: string;
}

export type CompleteOnboardingResponse = ApiSuccessResponse<Profile>;