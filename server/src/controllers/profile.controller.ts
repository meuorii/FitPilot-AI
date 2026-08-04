import type { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

// GET /api/profile/me
export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized', message: 'User ID missing from request' });
      return;
    }
    const { data: profile, error } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
    if (error || !profile) {
      res.status(404).json({ success: false, error: 'Not Found', message: 'User profile not found' });
      return;
    }
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal Server Error', message: err instanceof Error ? err.message : 'Failed to fetch profile' });
  }
};

// PATCH /api/profile/me
export const updateMyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized', message: 'User ID missing from request' });
      return;
    }
    const allowedFields = ['full_name', 'avatar_url', 'age', 'gender', 'height_cm', 'current_weight_kg', 'activity_level', 'fitness_experience', 'unit_system', 'theme'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key, val]) => allowedFields.includes(key) && val !== undefined));
    const { data: updatedProfile, error } = await supabaseAdmin.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', userId).select().single();
    if (error) {
      res.status(400).json({ success: false, error: 'Bad Request', message: error.message });
      return;
    }
    res.status(200).json({ success: true, data: updatedProfile, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal Server Error', message: err instanceof Error ? err.message : 'Failed to update profile' });
  }
};