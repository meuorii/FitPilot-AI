import type { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { calculateHealthProfile, calculateBMI, calculateAllGoalOptions, type UserMetrics } from '../utils/calculator.utils.js';

const PUBLIC_PROFILE_FIELDS = `id, email, full_name, avatar_url, age, gender, height_cm, current_weight_kg, activity_level, fitness_experience, unit_system, primary_goal, target_weight_kg, daily_calories, protein_grams, carbs_grams, fat_grams, workout_days_per_week, is_onboarded, email_verified, created_at, updated_at`;

const normalizePrimaryGoal = (goal: unknown): UserMetrics['primary_goal'] => {
  if (goal === 'maintenance') return 'maintain';
  if (goal === 'lose_weight' || goal === 'lose_fat' || goal === 'maintain' || goal === 'gain_muscle') return goal;
  return 'maintain';
};

export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) return void res.status(401).json({ success: false, error: 'Unauthorized', message: 'User ID missing from request' });
    const { data: profile, error } = await supabaseAdmin.from('profiles').select(PUBLIC_PROFILE_FIELDS).eq('id', userId).single();
    if (error || !profile) return void res.status(404).json({ success: false, error: 'Not Found', message: 'User profile not found' });
    const bmiInfo = calculateBMI(Number(profile.current_weight_kg), Number(profile.height_cm));
    res.status(200).json({ success: true, data: { ...profile, primary_goal: normalizePrimaryGoal(profile.primary_goal), health_insights: { bmi: bmiInfo.bmi, bmi_category: bmiInfo.category } } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal Server Error', message: err instanceof Error ? err.message : 'Failed to fetch profile' });
  }
};

export const calculateGoalOptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { age, gender, height_cm, weight_kg, activity_level } = req.body;
    if (!age || !gender || !height_cm || !weight_kg || !activity_level) {
      return void res.status(400).json({ success: false, error: 'Bad Request', message: 'Missing required fields: age, gender, height_cm, weight_kg, activity_level' });
    }
    const [numericAge, numericHeight, numericWeight] = [Number(age), Number(height_cm), Number(weight_kg)];
    if ([numericAge, numericHeight, numericWeight].some(num => !Number.isFinite(num) || num <= 0)) {
      return void res.status(400).json({ success: false, error: 'Bad Request', message: 'Age, height, and weight must be valid positive numbers.' });
    }
    const goalOptions = calculateAllGoalOptions({ age: numericAge, gender, height_cm: numericHeight, weight_kg: numericWeight, activity_level });
    res.status(200).json({ success: true, message: 'Goal options calculated successfully', data: goalOptions });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal Server Error', message: err instanceof Error ? err.message : 'Failed to calculate goal options' });
  }
};

export const updateMyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) return void res.status(401).json({ success: false, error: 'Unauthorized', message: 'User ID missing from request' });
    const allowedFields = ['full_name', 'avatar_url', 'age', 'gender', 'height_cm', 'current_weight_kg', 'target_weight_kg', 'activity_level', 'primary_goal', 'fitness_experience', 'unit_system', 'workout_days_per_week', 'is_onboarded', 'auto_recalculate_goals'];
    const updates: Record<string, unknown> = Object.fromEntries(Object.entries(req.body).filter(([k, v]) => allowedFields.includes(k) && v !== undefined));
    if (updates.primary_goal !== undefined) updates.primary_goal = normalizePrimaryGoal(updates.primary_goal);
    const numericFields = ['age', 'height_cm', 'current_weight_kg', 'target_weight_kg', 'workout_days_per_week'];
    for (const field of numericFields) {
      if (updates[field] === undefined || updates[field] === null) continue;
      const numericValue = Number(updates[field]);
      if (!Number.isFinite(numericValue)) return void res.status(400).json({ success: false, error: 'Bad Request', message: `${field} must be a valid number.` });
      updates[field] = numericValue;
    }
    if ((updates.age !== undefined && Number(updates.age) <= 0) || (updates.height_cm !== undefined && Number(updates.height_cm) <= 0) || (updates.current_weight_kg !== undefined && Number(updates.current_weight_kg) <= 0) || (updates.target_weight_kg !== undefined && updates.target_weight_kg !== null && Number(updates.target_weight_kg) <= 0)) {
      return void res.status(400).json({ success: false, error: 'Bad Request', message: 'Age, height, and weight values must be greater than zero.' });
    }
    if (updates.workout_days_per_week !== undefined && (Number(updates.workout_days_per_week) < 1 || Number(updates.workout_days_per_week) > 7)) {
      return void res.status(400).json({ success: false, error: 'Bad Request', message: 'Workout days per week must be between 1 and 7.' });
    }
    const autoRecalculateGoals = updates.auto_recalculate_goals !== false;
    const macroAffectingFields = ['age', 'gender', 'height_cm', 'current_weight_kg', 'activity_level', 'primary_goal'];
    const shouldRecalculateGoals = autoRecalculateGoals && macroAffectingFields.some(field => updates[field] !== undefined);
    delete updates.auto_recalculate_goals;
    if (shouldRecalculateGoals) {
      const { data: currentProfile, error: currentProfileError } = await supabaseAdmin.from('profiles').select('age, gender, height_cm, current_weight_kg, activity_level, primary_goal').eq('id', userId).single();
      if (currentProfileError || !currentProfile) return void res.status(404).json({ success: false, error: 'Not Found', message: 'User profile not found' });
      const mergedStats: UserMetrics = {
        age: updates.age !== undefined ? Number(updates.age) : Number(currentProfile.age),
        gender: (updates.gender ?? currentProfile.gender) as UserMetrics['gender'],
        height_cm: updates.height_cm !== undefined ? Number(updates.height_cm) : Number(currentProfile.height_cm),
        weight_kg: updates.current_weight_kg !== undefined ? Number(updates.current_weight_kg) : Number(currentProfile.current_weight_kg),
        activity_level: (updates.activity_level ?? currentProfile.activity_level) as UserMetrics['activity_level'],
        primary_goal: normalizePrimaryGoal(updates.primary_goal ?? currentProfile.primary_goal),
      };
      const computed = calculateHealthProfile(mergedStats);
      Object.assign(updates, { daily_calories: computed.daily_calories, protein_grams: computed.protein_grams, carbs_grams: computed.carbs_grams, fat_grams: computed.fat_grams });
    }
    const { data: updatedProfile, error } = await supabaseAdmin.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', userId).select(PUBLIC_PROFILE_FIELDS).single();
    if (error) return void res.status(400).json({ success: false, error: 'Bad Request', message: error.message });
    res.status(200).json({ success: true, message: 'Profile updated successfully', data: { ...updatedProfile, primary_goal: normalizePrimaryGoal(updatedProfile.primary_goal) } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal Server Error', message: err instanceof Error ? err.message : 'Failed to update profile' });
  }
};