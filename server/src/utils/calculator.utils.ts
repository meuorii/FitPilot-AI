export interface UserMetrics { age: number; gender: 'male' | 'female' | 'other'; height_cm: number; weight_kg: number; activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'; primary_goal: 'weight_loss' | 'maintenance' | 'muscle_gain'; }

export interface ComputedHealthProfile { bmi: number; bmi_category: string; bmr: number; tdee: number; daily_calories: number; protein_grams: number; carbs_grams: number; fat_grams: number; water_ml_goal: number; }

export const calculateBMI = (weightKg: number, heightCm: number): { bmi: number; category: string } => {
  if (!heightCm || heightCm <= 0 || !weightKg || weightKg <= 0) return { bmi: 0, category: 'Unknown' };
  const bmi = Number((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1));
  return { bmi, category: bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese' };
};

export const calculateHealthProfile = (metrics: UserMetrics): ComputedHealthProfile => {
  const { age, gender, height_cm, weight_kg, activity_level, primary_goal } = metrics;
  const genderOffset = gender === 'male' ? 5 : gender === 'female' ? -161 : -78;
  const bmr = Math.round(10 * weight_kg + 6.25 * height_cm - 5 * age + genderOffset);
  const activityMultipliers: Record<UserMetrics['activity_level'], number> = { sedentary: 1.2, lightly_active: 1.375, moderately_active: 1.55, very_active: 1.725, extra_active: 1.9 };
  const tdee = Math.round(bmr * (activityMultipliers[activity_level] ?? 1.2));
  const daily_calories = primary_goal === 'weight_loss' ? Math.max(Math.round(tdee * 0.80), bmr) : primary_goal === 'muscle_gain' ? Math.round(tdee + 300) : tdee;
  const protein_grams = Math.round(weight_kg * (primary_goal === 'weight_loss' ? 2.0 : primary_goal === 'muscle_gain' ? 2.2 : 1.6));
  const fat_grams = Math.round((daily_calories * 0.25) / 9);
  const carbs_grams = Math.max(30, Math.round((daily_calories - (protein_grams * 4 + fat_grams * 9)) / 4));
  const water_ml_goal = Math.round(weight_kg * 35);
  const { bmi, category: bmi_category } = calculateBMI(weight_kg, height_cm);
  return { bmi, bmi_category, bmr, tdee, daily_calories, protein_grams, carbs_grams, fat_grams, water_ml_goal };
};