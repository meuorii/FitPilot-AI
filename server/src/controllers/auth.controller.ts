import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase.js';
import { calculateHealthProfile } from '../utils/calculator.utils.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// 1. User Registration
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) {
      res.status(400).json({ success: false, message: 'Please provide email, password, and full name' });
      return;
    }
    const { data: existingUser } = await supabaseAdmin.from('profiles').select('id').eq('email', email).single();
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email is already registered' });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data: newUser, error } = await supabaseAdmin.from('profiles').insert([{ email, password_hash: hashedPassword, full_name, is_onboarded: false }]).select('id, email, full_name, is_onboarded').single();
    if (error) throw error;
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, message: 'Account registered successfully. Please complete onboarding.', data: { token, user: newUser } });
  } catch (err) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Registration failed' });
  }
};

// 2. User Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { data: user, error } = await supabaseAdmin.from('profiles').select('id, email, full_name, password_hash, is_onboarded').eq('email', email).single();
    if (error || !user || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ success: true, message: 'Logged in successfully', data: { token, user: { id: user.id, email: user.email, full_name: user.full_name, is_onboarded: user.is_onboarded } } });
  } catch (err) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Login failed' });
  }
};

// 3. Complete Onboarding Flow
export const completeOnboarding = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized access' });
      return;
    }
    const { age, gender, height_cm, current_weight_kg, activity_level, primary_goal, target_weight_kg } = req.body;
    if (!age || !gender || !height_cm || !current_weight_kg || !activity_level || !primary_goal) {
      res.status(400).json({ success: false, message: 'Missing required onboarding parameters' });
      return;
    }
    const computed = calculateHealthProfile({ age: Number(age), gender, height_cm: Number(height_cm), weight_kg: Number(current_weight_kg), activity_level, primary_goal });
    const updates = { age: Number(age), gender, height_cm: Number(height_cm), current_weight_kg: Number(current_weight_kg), target_weight_kg: target_weight_kg ? Number(target_weight_kg) : Number(current_weight_kg), activity_level, primary_goal, daily_calories: computed.daily_calories, protein_grams: computed.protein_grams, carbs_grams: computed.carbs_grams, fat_grams: computed.fat_grams, water_ml_goal: computed.water_ml_goal, is_onboarded: true, updated_at: new Date().toISOString() };
    const { data: updatedProfile, error } = await supabaseAdmin.from('profiles').update(updates).eq('id', userId).select('id, full_name, age, height_cm, current_weight_kg, daily_calories, protein_grams, carbs_grams, fat_grams, is_onboarded').single();
    if (error) throw error;
    res.status(200).json({ success: true, message: 'Onboarding completed successfully!', data: { profile: updatedProfile, health_insights: { bmi: computed.bmi, bmi_category: computed.bmi_category, bmr_kcal: computed.bmr, tdee_kcal: computed.tdee } } });
  } catch (err) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Onboarding failed' });
  }
};