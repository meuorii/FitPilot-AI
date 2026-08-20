import type { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { calculateHealthProfile, calculateBMI, calculateAllGoalOptions, type UserMetrics } from '../utils/calculator.utils.js';

export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, error: 'Unauthorized', message: 'User ID missing from request' }); return; }
    const { data: profile, error } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
    if (error || !profile) { res.status(404).json({ success: false, error: 'Not Found', message: 'User profile not found' }); return; }
    const bmiInfo = calculateBMI(Number(profile.current_weight_kg), Number(profile.height_cm));
    res.status(200).json({ success: true, data: { ...profile, health_insights: { bmi: bmiInfo.bmi, bmi_category: bmiInfo.category } } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal Server Error', message: err instanceof Error ? err.message : 'Failed to fetch profile' });
  }
};

export const calculateGoalOptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { age, gender, height_cm, weight_kg, activity_level } = req.body;
    if (!age || !gender || !height_cm || !weight_kg || !activity_level) { res.status(400).json({ success: false, error: 'Bad Request', message: 'Missing required fields: age, gender, height_cm, weight_kg, activity_level' }); return; }
    const goalOptions = calculateAllGoalOptions({ age: Number(age), gender, height_cm: Number(height_cm), weight_kg: Number(weight_kg), activity_level });
    res.status(200).json({ success: true, message: 'Goal options calculated successfully', data: goalOptions });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal Server Error', message: err instanceof Error ? err.message : 'Failed to calculate goal options' });
  }
};

export const updateMyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, error: 'Unauthorized', message: 'User ID missing from request' }); return; }
    const allowedFields = ['full_name', 'avatar_url', 'age', 'gender', 'height_cm', 'current_weight_kg', 'target_weight_kg', 'activity_level', 'primary_goal', 'fitness_experience', 'unit_system', 'theme', 'is_onboarded', 'auto_recalculate_goals'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k, v]) => allowedFields.includes(k) && v !== undefined));
    const { data: currentProfile } = await supabaseAdmin.from('profiles').select('age, gender, height_cm, current_weight_kg, activity_level, primary_goal').eq('id', userId).single();
    if (currentProfile) {
      const mergedStats: UserMetrics = { age: updates.age !== undefined ? Number(updates.age) : currentProfile.age, gender: updates.gender || currentProfile.gender, height_cm: updates.height_cm !== undefined ? Number(updates.height_cm) : Number(currentProfile.height_cm), weight_kg: updates.current_weight_kg !== undefined ? Number(updates.current_weight_kg) : Number(currentProfile.current_weight_kg), activity_level: updates.activity_level || currentProfile.activity_level, primary_goal: updates.primary_goal || currentProfile.primary_goal || 'maintain' };
      const computed = calculateHealthProfile(mergedStats);
      Object.assign(updates, { daily_calories: computed.daily_calories, protein_grams: computed.protein_grams, carbs_grams: computed.carbs_grams, fat_grams: computed.fat_grams, water_ml_goal: computed.water_ml_goal });
    }
    delete updates.auto_recalculate_goals;
    const { data: updatedProfile, error } = await supabaseAdmin.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', userId).select().single();
    if (error) { res.status(400).json({ success: false, error: 'Bad Request', message: error.message }); return; }
    res.status(200).json({ success: true, message: 'Profile updated successfully', data: updatedProfile });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal Server Error', message: err instanceof Error ? err.message : 'Failed to update profile' });
  }
};