import type { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { calculateHealthProfile, calculateBMI } from '../utils/calculator.utils.js';

// GET /api/v1/goals/me
export const getMyGoals = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized access' });
      return;
    }
    const { data: profile, error } = await supabaseAdmin.from('profiles').select('age, gender, height_cm, current_weight_kg, target_weight_kg, activity_level, primary_goal, daily_calories, protein_grams, carbs_grams, fat_grams, water_ml_goal, step_goal, workout_days_per_week').eq('id', userId).single();
    if (error || !profile) {
      res.status(404).json({ success: false, message: 'Profile goals not found' });
      return;
    }
    const bmiInfo = calculateBMI(Number(profile.current_weight_kg), Number(profile.height_cm));
    res.status(200).json({ success: true, data: { ...profile, bmi: bmiInfo.bmi, bmi_category: bmiInfo.category } });
  } catch (err) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Failed to fetch goals' });
  }
};

// PUT /api/v1/goals/me
export const updateMyGoals = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized access' });
      return;
    }
    const { primary_goal, target_weight_kg, daily_calories, protein_grams, carbs_grams, fat_grams, water_ml_goal, step_goal, workout_days_per_week, auto_recalculate = false } = req.body;
    let [finalCalories, finalProtein, finalCarbs, finalFat, finalWater] = [daily_calories, protein_grams, carbs_grams, fat_grams, water_ml_goal];
    if (auto_recalculate && primary_goal) {
      const { data: profile } = await supabaseAdmin.from('profiles').select('age, gender, height_cm, current_weight_kg, activity_level').eq('id', userId).single();
      if (profile) {
        const computed = calculateHealthProfile({ age: profile.age, gender: profile.gender, height_cm: Number(profile.height_cm), weight_kg: Number(profile.current_weight_kg), activity_level: profile.activity_level, primary_goal });
        [finalCalories, finalProtein, finalCarbs, finalFat, finalWater] = [computed.daily_calories, computed.protein_grams, computed.carbs_grams, computed.fat_grams, computed.water_ml_goal];
      }
    }
    const updates = { ...(primary_goal && { primary_goal }), ...(target_weight_kg !== undefined && { target_weight_kg: Number(target_weight_kg) }), ...(finalCalories !== undefined && { daily_calories: Number(finalCalories) }), ...(finalProtein !== undefined && { protein_grams: Number(finalProtein) }), ...(finalCarbs !== undefined && { carbs_grams: Number(finalCarbs) }), ...(finalFat !== undefined && { fat_grams: Number(finalFat) }), ...(finalWater !== undefined && { water_ml_goal: Number(finalWater) }), ...(step_goal !== undefined && { step_goal: Number(step_goal) }), ...(workout_days_per_week !== undefined && { workout_days_per_week: Number(workout_days_per_week) }), updated_at: new Date().toISOString() };
    const { data: updatedProfile, error } = await supabaseAdmin.from('profiles').update(updates).eq('id', userId).select('primary_goal, target_weight_kg, daily_calories, protein_grams, carbs_grams, fat_grams, water_ml_goal, step_goal, workout_days_per_week').single();
    if (error) throw error;
    res.status(200).json({ success: true, message: 'Goals updated successfully', data: updatedProfile });
  } catch (err) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Failed to update goals' });
  }
};