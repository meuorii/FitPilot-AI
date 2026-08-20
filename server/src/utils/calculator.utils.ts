export interface UserMetrics { age: number; gender: 'male' | 'female' | 'other'; height_cm: number; weight_kg: number; activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'; primary_goal: 'lose_weight' | 'lose_fat' | 'maintain' | 'gain_muscle'; }
export interface ComputedHealthProfile { bmi: number; bmi_category: string; bmr: number; tdee: number; daily_calories: number; protein_grams: number; carbs_grams: number; fat_grams: number; water_ml_goal: number; }
export interface GoalCalculationOption { goal: UserMetrics['primary_goal']; label: string; is_recommended: boolean; recommendation_reason?: string; recommended_target_weight_kg: number; metrics: ComputedHealthProfile; }

export const calculateBMI = (weightKg: number, heightCm: number): { bmi: number; category: string } => {
  if (!heightCm || heightCm <= 0 || !weightKg || weightKg <= 0) return { bmi: 0, category: 'Unknown' };
  const bmi = Number((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1));
  return { bmi, category: bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese' };
};

export const calculateRecommendedTargetWeight = (currentWeightKg: number, goal: UserMetrics['primary_goal']): number => {
  const targetMultipliers: Record<UserMetrics['primary_goal'], number> = { lose_fat: 0.95, lose_weight: 0.92, gain_muscle: 1.04, maintain: 1.0 };
  return Number((currentWeightKg * (targetMultipliers[goal] ?? 1.0)).toFixed(1));
};

export const calculateHealthProfile = (metrics: UserMetrics): ComputedHealthProfile => {
  const { age, gender, height_cm, weight_kg, activity_level, primary_goal } = metrics;
  const genderOffset = gender === 'male' ? 5 : gender === 'female' ? -161 : -78;
  const bmr = Math.round(10 * weight_kg + 6.25 * height_cm - 5 * age + genderOffset);
  const activityMultipliers: Record<UserMetrics['activity_level'], number> = { sedentary: 1.2, lightly_active: 1.375, moderately_active: 1.55, very_active: 1.725, extra_active: 1.9 };
  const goalMultipliers: Record<UserMetrics['primary_goal'], { calorie: number; protein: number }> = { lose_weight: { calorie: 0.8, protein: 2.0 }, lose_fat: { calorie: 0.85, protein: 2.2 }, gain_muscle: { calorie: 1.1, protein: 2.2 }, maintain: { calorie: 1.0, protein: 1.6 } };
  const tdee = Math.round(bmr * (activityMultipliers[activity_level] ?? 1.2));
  const { calorie: calorieMultiplier, protein: proteinMultiplier } = goalMultipliers[primary_goal] ?? goalMultipliers.maintain;
  const daily_calories = Math.max(Math.round(tdee * calorieMultiplier), bmr);
  const protein_grams = Math.round(weight_kg * proteinMultiplier);
  const fat_grams = Math.round((daily_calories * 0.25) / 9);
  const carbs_grams = Math.max(30, Math.round((daily_calories - (protein_grams * 4 + fat_grams * 9)) / 4));
  const water_ml_goal = Math.round(weight_kg * 35);
  const { bmi, category: bmi_category } = calculateBMI(weight_kg, height_cm);
  return { bmi, bmi_category, bmr, tdee, daily_calories, protein_grams, carbs_grams, fat_grams, water_ml_goal };
};

export const calculateAllGoalOptions = (input: Omit<UserMetrics, 'primary_goal'>): GoalCalculationOption[] => {
  const { bmi } = calculateBMI(input.weight_kg, input.height_cm);
  const recGoal: UserMetrics['primary_goal'] = bmi < 18.5 ? 'gain_muscle' : bmi < 25 ? 'maintain' : bmi < 30 ? 'lose_fat' : 'lose_weight';
  const reasons: Record<UserMetrics['primary_goal'], string> = {
    lose_weight: bmi >= 30 ? 'Recommended to safely and effectively lower your overall weight.' : 'Ideal if you want to lose overall weight quickly.',
    lose_fat: bmi >= 25 && bmi < 30 ? 'Recommended for an overweight BMI to lose body fat while maintaining muscle mass.' : 'Ideal for preserving muscle while reducing body fat.',
    maintain: bmi >= 18.5 && bmi < 25 ? 'You are currently in a normal BMI range. This is great for maintaining your weight.' : 'Perfect for maintaining your current weight.',
    gain_muscle: bmi < 18.5 ? 'Recommended because your BMI is underweight. This will help you reach a healthier weight.' : 'Recommended for building muscle mass and gaining weight.'
  };
  const goals: { goal: UserMetrics['primary_goal']; label: string }[] = [{ goal: 'lose_weight', label: 'Lose Weight' }, { goal: 'lose_fat', label: 'Lose Body Fat' }, { goal: 'maintain', label: 'Maintain Weight' }, { goal: 'gain_muscle', label: 'Gain Muscle' }];
  return goals.map((item) => ({ goal: item.goal, label: item.label, is_recommended: item.goal === recGoal, recommendation_reason: reasons[item.goal], recommended_target_weight_kg: calculateRecommendedTargetWeight(input.weight_kg, item.goal), metrics: calculateHealthProfile({ ...input, primary_goal: item.goal }) }));
};