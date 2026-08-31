export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
export type PrimaryGoal = 'lose_weight' | 'lose_fat' | 'maintain' | 'gain_muscle';

export interface UserMetrics { age: number; gender: 'male' | 'female' | 'other'; height_cm: number; weight_kg: number; activity_level: ActivityLevel; primary_goal: PrimaryGoal }
export interface ComputedHealthProfile { bmi: number; bmi_category: string; bmr: number; tdee: number; daily_calories: number; protein_grams: number; carbs_grams: number; fat_grams: number }
export interface GoalCalculationOption { goal: PrimaryGoal; label: string; is_recommended: boolean; recommendation_reason?: string; recommended_target_weight_kg: number; metrics: ComputedHealthProfile }

export const ACTIVITY_LEVELS: Record<ActivityLevel, { label: string; multiplier: number; description: string }> = {
  sedentary: { label: 'Sedentary', multiplier: 1.2, description: 'Little to no structured exercise during a typical week.' },
  lightly_active: { label: 'Lightly Active', multiplier: 1.375, description: 'Light exercise or training around 1 to 3 days per week.' },
  moderately_active: { label: 'Moderately Active', multiplier: 1.55, description: 'Moderate exercise or training around 3 to 5 days per week.' },
  very_active: { label: 'Very Active', multiplier: 1.725, description: 'Hard exercise or training around 6 to 7 days per week.' }
};

const GOAL_CONFIG: Record<PrimaryGoal, { calorieAdjustment: number; proteinPerKg: number; fatPerKg: number; targetWeightMultiplier: number }> = {
  lose_weight: { calorieAdjustment: -0.2, proteinPerKg: 2.0, fatPerKg: 0.8, targetWeightMultiplier: 0.92 },
  lose_fat: { calorieAdjustment: -0.15, proteinPerKg: 2.1, fatPerKg: 0.8, targetWeightMultiplier: 0.95 },
  maintain: { calorieAdjustment: 0, proteinPerKg: 1.6, fatPerKg: 0.9, targetWeightMultiplier: 1 },
  gain_muscle: { calorieAdjustment: 0.08, proteinPerKg: 1.8, fatPerKg: 0.9, targetWeightMultiplier: 1.04 }
};

const CALORIES_PER_GRAM = { protein: 4, carbs: 4, fat: 9 } as const;

export const isValidActivityLevel = (value: unknown): value is ActivityLevel => value === 'sedentary' || value === 'lightly_active' || value === 'moderately_active' || value === 'very_active';
export const isValidPrimaryGoal = (value: unknown): value is PrimaryGoal => value === 'lose_weight' || value === 'lose_fat' || value === 'maintain' || value === 'gain_muscle';

export const calculateBMI = (weightKg: number, heightCm: number): { bmi: number; category: string } => {
  if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm) || weightKg <= 0 || heightCm <= 0) return { bmi: 0, category: 'Unknown' };
  const heightMeters = heightCm / 100;
  const bmi = Number((weightKg / heightMeters ** 2).toFixed(1));
  const category = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  return { bmi, category };
};

export const calculateRecommendedTargetWeight = (currentWeightKg: number, goal: PrimaryGoal): number => {
  if (!Number.isFinite(currentWeightKg) || currentWeightKg <= 0) return 0;
  return Number((currentWeightKg * GOAL_CONFIG[goal].targetWeightMultiplier).toFixed(1));
};

export const calculateBMR = ({ age, gender, height_cm, weight_kg }: Pick<UserMetrics, 'age' | 'gender' | 'height_cm' | 'weight_kg'>): number => {
  const genderOffset = gender === 'male' ? 5 : gender === 'female' ? -161 : -78;
  return Math.round(10 * weight_kg + 6.25 * height_cm - 5 * age + genderOffset);
};

export const calculateTDEE = (bmr: number, activityLevel: ActivityLevel): number => Math.round(bmr * ACTIVITY_LEVELS[activityLevel].multiplier);

const calculateGoalCalories = (tdee: number, goal: PrimaryGoal): number => Math.round(tdee * (1 + GOAL_CONFIG[goal].calorieAdjustment));

const calculateMacros = (dailyCalories: number, weightKg: number, goal: PrimaryGoal): Pick<ComputedHealthProfile, 'protein_grams' | 'carbs_grams' | 'fat_grams'> => {
  const { proteinPerKg, fatPerKg } = GOAL_CONFIG[goal];
  const protein_grams = Math.round(weightKg * proteinPerKg);
  const fat_grams = Math.round(weightKg * fatPerKg);
  const proteinCalories = protein_grams * CALORIES_PER_GRAM.protein;
  const fatCalories = fat_grams * CALORIES_PER_GRAM.fat;
  const caloriesRemainingForCarbs = dailyCalories - proteinCalories - fatCalories;
  const carbs_grams = Math.max(0, Math.round(caloriesRemainingForCarbs / CALORIES_PER_GRAM.carbs));
  return { protein_grams, carbs_grams, fat_grams };
};

const validateMetrics = (metrics: UserMetrics): void => {
  const { age, height_cm, weight_kg, activity_level, primary_goal } = metrics;
  if (!Number.isFinite(age) || !Number.isFinite(height_cm) || !Number.isFinite(weight_kg) || age <= 0 || height_cm <= 0 || weight_kg <= 0) throw new Error('Age, height, and weight must be valid positive numbers.');
  if (!isValidActivityLevel(activity_level)) throw new Error('Invalid activity level.');
  if (!isValidPrimaryGoal(primary_goal)) throw new Error('Invalid primary goal.');
};

export const calculateHealthProfile = (metrics: UserMetrics): ComputedHealthProfile => {
  validateMetrics(metrics);
  const { age, gender, height_cm, weight_kg, activity_level, primary_goal } = metrics;
  const bmr = calculateBMR({ age, gender, height_cm, weight_kg });
  const tdee = calculateTDEE(bmr, activity_level);
  const daily_calories = calculateGoalCalories(tdee, primary_goal);
  const { protein_grams, carbs_grams, fat_grams } = calculateMacros(daily_calories, weight_kg, primary_goal);
  const { bmi, category: bmi_category } = calculateBMI(weight_kg, height_cm);
  return { bmi, bmi_category, bmr, tdee, daily_calories, protein_grams, carbs_grams, fat_grams };
};

export const calculateAllGoalOptions = (input: Omit<UserMetrics, 'primary_goal'>): GoalCalculationOption[] => {
  if (!isValidActivityLevel(input.activity_level)) throw new Error('Invalid activity level.');
  const { bmi } = calculateBMI(input.weight_kg, input.height_cm);
  const recommendedGoal: PrimaryGoal = bmi < 18.5 ? 'gain_muscle' : bmi < 25 ? 'maintain' : bmi < 30 ? 'lose_fat' : 'lose_weight';

  const reasons: Record<PrimaryGoal, string> = {
    lose_weight: bmi >= 30 ? 'Recommended for reducing overall body weight with a controlled calorie deficit.' : 'Suitable if your main goal is reducing overall body weight.',
    lose_fat: bmi >= 25 && bmi < 30 ? 'Recommended for reducing body fat while supporting muscle retention.' : 'Suitable if your priority is losing body fat while preserving muscle.',
    maintain: bmi >= 18.5 && bmi < 25 ? 'Recommended because your BMI is currently within the normal range.' : 'Suitable for maintaining your current body weight and nutrition intake.',
    gain_muscle: bmi < 18.5 ? 'Recommended because your BMI is currently below the normal range.' : 'Suitable for supporting muscle growth with a controlled calorie surplus.'
  };

  const goals: Array<{ goal: PrimaryGoal; label: string }> = [
    { goal: 'lose_weight', label: 'Lose Weight' },
    { goal: 'lose_fat', label: 'Lose Body Fat' },
    { goal: 'maintain', label: 'Maintain Weight' },
    { goal: 'gain_muscle', label: 'Gain Muscle' }
  ];

  return goals.map(({ goal, label }) => ({
    goal,
    label,
    is_recommended: goal === recommendedGoal,
    recommendation_reason: reasons[goal],
    recommended_target_weight_kg: calculateRecommendedTargetWeight(input.weight_kg, goal),
    metrics: calculateHealthProfile({ ...input, primary_goal: goal })
  }));
};