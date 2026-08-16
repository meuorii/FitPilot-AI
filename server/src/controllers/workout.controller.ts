import type { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

interface RoutineExerciseInput { exercise_id: string; target_sets?: number; target_reps_min?: number; target_reps_max?: number; order_index?: number; }
interface WorkoutSetInput { exercise_id: string; set_number: number; weight_kg?: number; reps?: number; set_type?: string; }

const getUserId = (req: Request): string | null => req.user?.id ?? null;

// GET /workouts/routines - Fetch global and user routines
export const getRoutines = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const filter = userId ? `is_global.eq.true,user_id.eq.${userId}` : 'is_global.eq.true';
    const { data, error } = await supabase.from('workout_routines').select(`id, user_id, name, description, cover_image_url, is_global, created_at, updated_at, routine_exercises (id, target_sets, target_reps_min, target_reps_max, order_index, exercises (id, name, category, equipment, difficulty, image_url))`).or(filter).order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json({ success: true, data: data ?? [] });
  } catch (error) {
    console.error('getRoutines error:', error);
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to fetch routines' });
  }
};

// GET /workouts/exercises - Fetch global exercise library
export const getExercises = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase.from('exercises').select('id, name, category, equipment, difficulty, instructions, image_url, created_at').order('name', { ascending: true });
    if (error) throw error;
    res.status(200).json({ success: true, data: data ?? [] });
  } catch (error) {
    console.error('getExercises error:', error);
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to fetch exercises' });
  }
};

// POST /workouts/exercises - Create a new global exercise
export const createExercise = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized: User ID missing' }); return; }
    const { name, category, equipment, difficulty, instructions, image_url } = req.body;
    if (!name || !category || !equipment) { res.status(400).json({ success: false, message: 'Name, category, and equipment are required.' }); return; }
    const cleanName = String(name).trim();
    if (!cleanName) { res.status(400).json({ success: false, message: 'Exercise name cannot be empty.' }); return; }
    const { data, error } = await supabase.from('exercises').insert({ name: cleanName, category, equipment, difficulty: difficulty || 'beginner', instructions: Array.isArray(instructions) ? instructions : [], image_url: image_url || null }).select().single();
    if (error) {
      if (error.code === '23505') { res.status(409).json({ success: false, message: 'An exercise with this name already exists.' }); return; }
      throw error;
    }
    res.status(201).json({ success: true, message: 'Exercise added successfully.', data });
  } catch (error) {
    console.error('createExercise error:', error);
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to create exercise' });
  }
};

// POST /workouts/routines - Create custom routine with exercises
export const createCustomRoutine = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized: User ID missing' }); return; }
    const { name, description, cover_image_url, exercises }: { name: string; description?: string; cover_image_url?: string; exercises?: RoutineExerciseInput[]; } = req.body;
    if (!name || !String(name).trim()) { res.status(400).json({ success: false, message: 'Routine name is required.' }); return; }
    if (exercises !== undefined && !Array.isArray(exercises)) { res.status(400).json({ success: false, message: 'Exercises must be an array.' }); return; }

    const { data: routine, error: routineError } = await supabase.from('workout_routines').insert({ user_id: userId, name: String(name).trim(), description: description || null, cover_image_url: cover_image_url || null, is_global: false }).select().single();
    if (routineError) throw routineError;

    if (exercises && exercises.length > 0) {
      const routineExercisesData = exercises.map((item, index) => {
        const targetSets = Number(item.target_sets ?? 3), targetRepsMin = Number(item.target_reps_min ?? 8), targetRepsMax = Number(item.target_reps_max ?? 12), orderIndex = Number(item.order_index ?? index + 1);
        if (!item.exercise_id) throw new Error(`Exercise ID is required for exercise ${index + 1}.`);
        if (targetSets <= 0) throw new Error(`Target sets must be greater than 0 for exercise ${index + 1}.`);
        if (targetRepsMin <= 0) throw new Error(`Minimum target reps must be greater than 0 for exercise ${index + 1}.`);
        if (targetRepsMax < targetRepsMin) throw new Error(`Maximum target reps cannot be lower than minimum target reps for exercise ${index + 1}.`);
        return { routine_id: routine.id, exercise_id: item.exercise_id, target_sets: targetSets, target_reps_min: targetRepsMin, target_reps_max: targetRepsMax, order_index: orderIndex };
      });
      const { error: exercisesError } = await supabase.from('routine_exercises').insert(routineExercisesData);
      if (exercisesError) {
        await supabase.from('workout_routines').delete().eq('id', routine.id).eq('user_id', userId);
        throw exercisesError;
      }
    }

    const { data: completeRoutine, error: fetchError } = await supabase.from('workout_routines').select(`id, user_id, name, description, cover_image_url, is_global, created_at, updated_at, routine_exercises (id, target_sets, target_reps_min, target_reps_max, order_index, exercises (id, name, category, equipment, difficulty, image_url))`).eq('id', routine.id).single();
    if (fetchError) throw fetchError;

    res.status(201).json({ success: true, message: 'Routine created successfully.', data: completeRoutine });
  } catch (error) {
    console.error('createCustomRoutine error:', error);
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to create routine' });
  }
};

// POST /workouts/sessions - Log workout session and sets
export const logWorkoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized: User ID missing' }); return; }
    const { routine_id, workout_date, notes, sets }: { routine_id?: string; workout_date?: string; notes?: string; sets?: WorkoutSetInput[]; } = req.body;
    if (!sets || !Array.isArray(sets) || sets.length === 0) { res.status(400).json({ success: false, message: 'At least one workout set is required.' }); return; }

    for (const [index, item] of sets.entries()) {
      if (!item.exercise_id) { res.status(400).json({ success: false, message: `Exercise ID is required for set ${index + 1}.` }); return; }
      if (!Number.isInteger(Number(item.set_number)) || Number(item.set_number) <= 0) { res.status(400).json({ success: false, message: `Invalid set number for set ${index + 1}.` }); return; }
      if (Number(item.weight_kg ?? 0) < 0) { res.status(400).json({ success: false, message: `Weight cannot be negative for set ${index + 1}.` }); return; }
      if (Number(item.reps ?? 0) < 0) { res.status(400).json({ success: false, message: `Reps cannot be negative for set ${index + 1}.` }); return; }
    }

    const totalVolume = sets.reduce((total, item) => total + Number(item.weight_kg ?? 0) * Number(item.reps ?? 0), 0);
    const { data: session, error: sessionError } = await supabase.from('workout_sessions').insert({ user_id: userId, routine_id: routine_id || null, workout_date: workout_date || new Date().toISOString().split('T')[0], notes: notes || null, total_volume_kg: totalVolume }).select().single();
    if (sessionError) throw sessionError;

    const setsPayload = sets.map((item) => ({ session_id: session.id, exercise_id: item.exercise_id, set_number: Number(item.set_number), weight_kg: Number(item.weight_kg ?? 0), reps: Number(item.reps ?? 0), set_type: item.set_type || 'working', is_completed: true }));
    const { error: setsError } = await supabase.from('workout_sets').insert(setsPayload);
    if (setsError) {
      await supabase.from('workout_sessions').delete().eq('id', session.id).eq('user_id', userId);
      throw setsError;
    }

    res.status(201).json({ success: true, message: 'Workout logged successfully.', data: { session_id: session.id, workout_date: session.workout_date, total_sets: sets.length, total_volume_kg: totalVolume } });
  } catch (error) {
    console.error('logWorkoutSession error:', error);
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to log workout session' });
  }
};

// GET /workouts/history - Fetch user workout history
export const getWorkoutHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized: User ID missing' }); return; }
    const { data: history, error } = await supabase.from('workout_sessions').select(`id, workout_date, notes, total_volume_kg, created_at, workout_routines (id, name), workout_sets (id, set_number, weight_kg, reps, set_type, is_completed, exercises (id, name, category))`).eq('user_id', userId).order('workout_date', { ascending: false }).order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json({ success: true, data: history ?? [] });
  } catch (error) {
    console.error('getWorkoutHistory error:', error);
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to fetch workout history' });
  }
};