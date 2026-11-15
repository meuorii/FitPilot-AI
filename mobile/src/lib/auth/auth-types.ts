export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  is_onboarded: boolean;
  email_verified: boolean;
};

export type PrimaryGoal = 'lose_weight' | 'lose_fat' | 'maintain' | 'gain_muscle';
export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';

export type Profile = AuthUser & {
  avatar_url: string | null;
  age: number | null;
  gender: Gender | 'other' | null;
  height_cm: number | null;
  current_weight_kg: number | null;
  target_weight_kg: number | null;
  activity_level: ActivityLevel | null;
  primary_goal: PrimaryGoal | null;
  daily_calories: number | null;
  protein_grams: number | null;
  carbs_grams: number | null;
  fat_grams: number | null;
  fitness_experience: string | null;
  unit_system: string | null;
  workout_days_per_week: number | null;
  created_at: string;
  updated_at: string;
};

export type GoalMetrics = {
  bmi: number;
  bmi_category: string;
  bmr: number;
  tdee: number;
  daily_calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
};

export type GoalOption = {
  goal: PrimaryGoal;
  label: string;
  is_recommended: boolean;
  recommendation_reason?: string;
  recommended_target_weight_kg: number;
  metrics: GoalMetrics;
};

export type AboutYouDraft = {
  age: string;
  gender: Gender | '';
  height_cm: string;
  weight_kg: string;
  activity_level: ActivityLevel | '';
};

export type CalculateGoalsRequest = {
  age: number;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
};

export type CompleteOnboardingRequest = {
  age: number;
  gender: Gender;
  height_cm: number;
  current_weight_kg: number;
  target_weight_kg: number;
  activity_level: ActivityLevel;
  primary_goal: PrimaryGoal;
  is_onboarded: true;
};

export const emptyAboutYouDraft: AboutYouDraft = {
  age: '', gender: '', height_cm: '', weight_kg: '', activity_level: '',
};
