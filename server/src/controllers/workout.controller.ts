import type { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const getRoutines = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { data: routines, error } = await supabase.from('workout_routines').select(`id, name, description, cover_image_url, is_global, routine_exercises (id, target_sets, order_index, exercises (id, name, category, equipment, image_url))`).or(`is_global.eq.true${userId ? `,user_id.eq.${userId}` : ''}`).order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json({ success: true, data: routines });
  } catch (error) { res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to fetch routines' }); }
};

export const getExercises = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data: exercises, error } = await supabase.from('exercises').select('*').order('name', { ascending: true });
    if (error) throw error;
    res.status(200).json({ success: true, data: exercises });
  } catch (error) { res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to fetch exercises' }); }
};

export const createExercise = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized: User ID missing' }); return; }
    const { name, category, equipment, difficulty, instructions, image_url } = req.body;
    if (!name || !category || !equipment) { res.status(400).json({ success: false, message: 'Name, category, and equipment are required fields.' }); return; }
    const { data: exercise, error } = await supabase.from('exercises').insert({ name, category, equipment, difficulty: difficulty || 'beginner', instructions: instructions || [], image_url: image_url || null }).select().single();
    if (error) {
      if (error.code === '23505') { res.status(400).json({ success: false, message: 'An exercise with this name already exists.' }); return; }
      throw error;
    }
    res.status(201).json({ success: true, message: 'Exercise added successfully to the library!', data: exercise });
  } catch (error) { res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to create exercise' }); }
};

export const createCustomRoutine = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized: User ID missing' }); return; }
    const { name, description, cover_image_url, exercises } = req.body;
    const { data: routine, error: routineError } = await supabase.from('workout_routines').insert({ user_id: userId, name, description, cover_image_url, is_global: false }).select().single();
    if (routineError) throw routineError;
    if (exercises && Array.isArray(exercises) && exercises.length > 0) {
      const routineExercisesData = exercises.map((item: any, index: number) => ({ routine_id: routine.id, exercise_id: item.exercise_id, target_sets: item.target_sets || 3, order_index: item.order_index || index + 1 }));
      const { error: exercisesError } = await supabase.from('routine_exercises').insert(routineExercisesData);
      if (exercisesError) throw exercisesError;
    }
    res.status(201).json({ success: true, message: 'Routine created successfully!', data: routine });
  } catch (error) { res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to create routine' }); }
};

export const logWorkoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized: User ID missing' }); return; }
    const { routine_id, workout_date, notes, sets } = req.body;
    if (!sets || !Array.isArray(sets) || sets.length === 0) { res.status(400).json({ success: false, message: 'No sets provided to log.' }); return; }
    const totalVolume = sets.reduce((acc: number, curr: any) => acc + Number(curr.weight_kg || 0) * Number(curr.reps || 0), 0);
    const { data: session, error: sessionError } = await supabase.from('workout_sessions').insert({ user_id: userId, routine_id: routine_id || null, workout_date: workout_date || new Date().toISOString().split('T')[0], notes, total_volume_kg: totalVolume }).select().single();
    if (sessionError) throw sessionError;
    const setsPayload = sets.map((item: any) => ({ session_id: session.id, exercise_id: item.exercise_id, set_number: item.set_number, weight_kg: item.weight_kg, reps: item.reps, set_type: item.set_type || 'working', is_completed: true }));
    const { error: setsError } = await supabase.from('workout_sets').insert(setsPayload);
    if (setsError) throw setsError;
    res.status(201).json({ success: true, message: 'Workout logged successfully!', data: { session_id: session.id, total_volume_kg: totalVolume } });
  } catch (error) { res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to log workout session' }); }
};

export const getWorkoutHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized: User ID missing' }); return; }
    const { data: history, error } = await supabase.from('workout_sessions').select(`id, workout_date, notes, total_volume_kg, created_at, workout_routines (name), workout_sets (id, set_number, weight_kg, reps, set_type, exercises (id, name, category))`).eq('user_id', userId).order('workout_date', { ascending: false });
    if (error) throw error;
    res.status(200).json({ success: true, data: history });
  } catch (error) { res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to fetch workout history' }); }
};