import type { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, error: 'Unauthorized', message: 'User ID missing' }); return; }
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
    const [profileRes, mealsRes, workoutsRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('full_name, avatar_url, streak_count, is_onboarded, daily_calories, protein_grams, carbs_grams, fat_grams, water_ml_goal, step_goal').eq('id', userId).single(),
      supabaseAdmin.from('meal_logs').select('total_calories, total_protein, total_carbs, total_fat, meal_type, logged_at').eq('user_id', userId).gte('logged_at', startOfDay).lte('logged_at', endOfDay),
      supabaseAdmin.from('workout_sessions').select('id, title, duration_minutes, total_volume_kg, calories_burned, completed_at').eq('user_id', userId).gte('completed_at', startOfDay).lte('completed_at', endOfDay)
    ]);
    if (profileRes.error) { console.error('Error fetching profile:', profileRes.error); res.status(400).json({ success: false, error: 'Bad Request', message: profileRes.error.message }); return; }
    const profile = profileRes.data, meals = mealsRes.data || [], workouts = workoutsRes.data || [];
    const nutritionConsumed = meals.reduce((acc, meal) => { acc.calories += Number(meal.total_calories || 0); acc.protein += Number(meal.total_protein || 0); acc.carbs += Number(meal.total_carbs || 0); acc.fat += Number(meal.total_fat || 0); return acc; }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    const workoutSummary = workouts.reduce((acc, session) => { acc.total_duration_minutes += Number(session.duration_minutes || 0); acc.total_calories_burned += Number(session.calories_burned || 0); acc.total_volume_kg += Number(session.total_volume_kg || 0); return acc; }, { total_duration_minutes: 0, total_calories_burned: 0, total_volume_kg: 0 });
    const goals = { calories: profile.daily_calories || 2000, protein: profile.protein_grams || 150, carbs: profile.carbs_grams || 200, fat: profile.fat_grams || 65, water_ml: profile.water_ml_goal || 3000, steps: profile.step_goal || 10000 };
    const nutritionSummary = {
      calories: { goal: goals.calories, consumed: nutritionConsumed.calories, remaining: Math.max(0, goals.calories - nutritionConsumed.calories) },
      protein: { goal: goals.protein, consumed: Number(nutritionConsumed.protein.toFixed(1)), remaining: Math.max(0, Number((goals.protein - nutritionConsumed.protein).toFixed(1))) },
      carbs: { goal: goals.carbs, consumed: Number(nutritionConsumed.carbs.toFixed(1)), remaining: Math.max(0, Number((goals.carbs - nutritionConsumed.carbs).toFixed(1))) },
      fat: { goal: goals.fat, consumed: Number(nutritionConsumed.fat.toFixed(1)), remaining: Math.max(0, Number((goals.fat - nutritionConsumed.fat).toFixed(1))) }
    };
    res.status(200).json({
      success: true,
      data: {
        user: { full_name: profile.full_name, avatar_url: profile.avatar_url, streak_count: profile.streak_count, is_onboarded: profile.is_onboarded },
        nutrition: nutritionSummary,
        workouts: { completed_today: workouts.length > 0, sessions_count: workouts.length, total_duration_minutes: workoutSummary.total_duration_minutes, total_calories_burned: workoutSummary.total_calories_burned, total_volume_kg: Number(workoutSummary.total_volume_kg.toFixed(2)), sessions: workouts },
        water: { goal_ml: goals.water_ml },
        steps: { goal: goals.steps }
      }
    });
  } catch (err) {
    console.error('Dashboard Summary Error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: err instanceof Error ? err.message : 'Failed to retrieve dashboard summary' });
  }
};