import type { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { aiServiceClient } from '../services/ai-service.client.js';

export const parseMealText = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) { res.status(400).json({ success: false, error: 'Bad Request', message: 'Please provide a non-empty text prompt to parse meal.' }); return; }
    const aiParsedResult = await aiServiceClient.parseMeal(text.trim());
    res.status(200).json({ success: true, message: 'Meal parsed successfully', data: aiParsedResult });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal Server Error', message: err instanceof Error ? err.message : 'Failed to parse meal with AI service' });
  }
};

export const logMeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, error: 'Unauthorized', message: 'User ID missing' }); return; }
    const payload = req.body?.data || req.body || {};
    const { foods, totalCalories, total_calories, protein, total_protein, carbs, total_carbs, fat, total_fat } = payload;
    const meal_type = req.body?.meal_type || payload.meal_type || 'snack';
    const raw_input_prompt = req.body?.raw_input_prompt || req.body?.raw_text || payload.raw_input_prompt || payload.raw_text || '';
    const food_items = foods || payload.food_items || payload.foods;
    if (!food_items || !Array.isArray(food_items) || food_items.length === 0) { res.status(400).json({ success: false, error: 'Bad Request', message: 'At least one food item is required to log a meal.' }); return; }
    const finalCalories = Math.round(Number(total_calories ?? totalCalories) || 0);
    const finalProtein = Number(total_protein ?? protein) || 0;
    const finalCarbs = Number(total_carbs ?? carbs) || 0;
    const finalFat = Number(total_fat ?? fat) || 0;
    const { data: newMealLog, error } = await supabaseAdmin.from('meal_logs').insert([{ user_id: userId, meal_type, raw_input_prompt, food_items, total_calories: finalCalories, total_protein: finalProtein, total_carbs: finalCarbs, total_fat: finalFat, logged_at: new Date().toISOString() }]).select('*').single();
    if (error) { console.error('Supabase Meal Log Error:', error); res.status(400).json({ success: false, error: 'Bad Request', message: error.message }); return; }
    res.status(201).json({ success: true, message: 'Meal logged successfully!', data: newMealLog });
  } catch (err) {
    console.error('Log Meal Internal Error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: err instanceof Error ? err.message : 'Failed to log meal' });
  }
};

export const getTodayMeals = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, error: 'Unauthorized', message: 'User ID missing' }); return; }
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
    const { data: todayMeals, error } = await supabaseAdmin.from('meal_logs').select('*').eq('user_id', userId).gte('logged_at', startOfDay).lte('logged_at', endOfDay).order('logged_at', { ascending: false });
    if (error) throw error;
    const totals = (todayMeals || []).reduce((acc, meal) => { acc.calories += Number(meal.total_calories || 0); acc.protein += Number(meal.total_protein || 0); acc.carbs += Number(meal.total_carbs || 0); acc.fat += Number(meal.total_fat || 0); return acc; }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    res.status(200).json({ success: true, data: { meals: todayMeals || [], today_summary: { total_calories: totals.calories, total_protein: Number(totals.protein.toFixed(1)), total_carbs: Number(totals.carbs.toFixed(1)), total_fat: Number(totals.fat.toFixed(1)) } } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal Server Error', message: err instanceof Error ? err.message : 'Failed to fetch today meals' });
  }
};

export const deleteMealLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, error: 'Unauthorized', message: 'User ID missing' }); return; }
    const { mealId } = req.params;
    const { error } = await supabaseAdmin.from('meal_logs').delete().eq('id', mealId).eq('user_id', userId);
    if (error) { res.status(400).json({ success: false, error: 'Bad Request', message: error.message }); return; }
    res.status(200).json({ success: true, message: 'Meal log deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal Server Error', message: err instanceof Error ? err.message : 'Failed to delete meal log' });
  }
};