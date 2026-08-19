import type { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { aiServiceClient, type UserContext, type CoachChatMessage } from '../services/ai-service.client.js';

export const handleCoachChat = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { message, history } = req.body as { message: string; history?: CoachChatMessage[] };
    if (!message) return res.status(400).json({ error: 'Message is required.' });
    const startOfDay = new Date(); startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(); endOfDay.setUTCHours(23, 59, 59, 999);
    const todayDateStr = new Date().toISOString().split('T')[0];
    const [profileRes, mealsRes, workoutsRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('full_name, primary_goal, fitness_experience, current_weight_kg, target_weight_kg, daily_calories, protein_grams, carbs_grams, fat_grams').eq('id', userId).single(),
      supabaseAdmin.from('meal_logs').select('total_calories, total_protein, total_carbs, total_fat').eq('user_id', userId).gte('logged_at', startOfDay.toISOString()).lte('logged_at', endOfDay.toISOString()),
      supabaseAdmin.from('workout_sessions').select('total_volume_kg, notes, workout_routines(name)').eq('user_id', userId).eq('workout_date', todayDateStr)
    ]);
    if (profileRes.error || !profileRes.data) return res.status(404).json({ error: 'User profile not found.' });
    const profile = profileRes.data, meals = mealsRes.data || [], workouts = workoutsRes.data || [];
    const context: UserContext = {
      fullName: profile.full_name, fitnessGoal: profile.primary_goal, fitnessExperience: profile.fitness_experience,
      currentWeightKg: profile.current_weight_kg ? Number(profile.current_weight_kg) : undefined,
      targetWeightKg: profile.target_weight_kg ? Number(profile.target_weight_kg) : undefined,
      dailyCalorieGoal: profile.daily_calories,
      dailyProteinGoal: profile.protein_grams ? Number(profile.protein_grams) : undefined,
      dailyCarbsGoal: profile.carbs_grams ? Number(profile.carbs_grams) : undefined,
      dailyFatGoal: profile.fat_grams ? Number(profile.fat_grams) : undefined,
      consumedCaloriesToday: meals.reduce((sum, m) => sum + (m.total_calories || 0), 0),
      consumedProteinToday: meals.reduce((sum, m) => sum + Number(m.total_protein || 0), 0),
      consumedCarbsToday: meals.reduce((sum, m) => sum + Number(m.total_carbs || 0), 0),
      consumedFatToday: meals.reduce((sum, m) => sum + Number(m.total_fat || 0), 0),
      todaysWorkouts: workouts.map((w: any) => ({ routine_name: w.workout_routines?.name || 'Custom Workout', total_volume_kg: Number(w.total_volume_kg || 0), notes: w.notes || undefined }))
    };
    const aiResponse = await aiServiceClient.coachChat({ message, history: history || [], context });
    return res.status(200).json({ reply: aiResponse.reply });
  } catch (error: any) {
    console.error('🔥 [Coach Controller Error]:', error.message || error);
    return res.status(500).json({ error: error.message || 'Failed to process AI Coach chat request.' });
  }
};