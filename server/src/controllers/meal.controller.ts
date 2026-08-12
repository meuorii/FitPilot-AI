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
    const { meal_type = 'snack', raw_text, foods, total_calories, totalCalories, protein_grams, protein, carbs_grams, carbs, fat_grams, fat } = req.body;
    if (!foods || !Array.isArray(foods) || foods.length === 0) { res.status(400).json({ success: false, error: 'Bad Request', message: 'At least one food item is required to log a meal.' }); return; }
    const finalCalories = Number(total_calories ?? totalCalories) || 0;
    const finalProtein = Number(protein_grams ?? protein) || 0;
    const finalCarbs = Number(carbs_grams ?? carbs) || 0;
    const finalFat = Number(fat_grams ?? fat) || 0;
    const { data: newMealLog, error } = await supabaseAdmin.from('meal_logs').insert([{ user_id: userId, meal_type, raw_text: raw_text || '', foods, total_calories: finalCalories, protein_grams: finalProtein, carbs_grams: finalCarbs, fat_grams: finalFat, logged_at: new Date().toISOString() }]).select('*').single();
    if (error) { res.status(400).json({ success: false, error: 'Bad Request', message: error.message }); return; }
    res.status(201).json({ success: true, message: 'Meal logged successfully!', data: newMealLog });
  } catch (err) {
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
    const totals = (todayMeals || []).reduce((acc, meal) => { acc.calories += Number(meal.total_calories || 0); acc.protein += Number(meal.protein_grams || 0); acc.carbs += Number(meal.carbs_grams || 0); acc.fat += Number(meal.fat_grams || 0); return acc; }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
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