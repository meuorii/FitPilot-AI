import type { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

interface RoutineExerciseInput {
  exercise_id: string;
  target_sets?: number;
  target_reps_min?: number;
  target_reps_max?: number;
  rest_seconds?: number;
  notes?: string | null;
  order_index?: number;
}

interface WorkoutSetInput {
  exercise_id: string;
  set_number: number;
  weight_kg?: number;
  reps?: number;
  set_type?: string;
}

interface SplitDayInput {
  day_of_week: number;
  routine_id?: string | null;
  is_rest_day?: boolean;
  order_index?: number;
}

const ROUTINE_SELECT = `
  id,
  user_id,
  name,
  description,
  cover_image_url,
  is_global,
  created_at,
  updated_at,
  routine_exercises (
    id,
    exercise_id,
    target_sets,
    target_reps_min,
    target_reps_max,
    rest_seconds,
    notes,
    order_index,
    created_at,
    exercises (
      id,
      name,
      category,
      equipment,
      difficulty,
      instructions,
      image_url,
      created_at
    )
  )
`;

const getUserId = (req: Request): string | null => req.user?.id ?? null;

type IdParam = string | string[] | undefined | null;

const normalizeIdParam = (value: IdParam): string | null => {
  if (Array.isArray(value)) return value[0]?.trim() || null;
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized || null;
};

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

const sendUnauthorized = (res: Response): void => {
  res.status(401).json({ success: false, message: 'Unauthorized: User ID missing.' });
};

const toPositiveInteger = (value: unknown, fallback: number): number => {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) ? parsed : Number.NaN;
};

const sortRoutine = <T extends Record<string, any> | null>(routine: T): T => {
  if (!routine) return routine;
  if (Array.isArray(routine.routine_exercises)) {
    routine.routine_exercises.sort(
      (a: any, b: any) => Number(a.order_index ?? 0) - Number(b.order_index ?? 0),
    );
  }
  return routine;
};

const validateRoutineExerciseInputs = async (
  exercises: RoutineExerciseInput[],
): Promise<Array<Record<string, unknown>>> => {
  if (!Array.isArray(exercises)) throw new Error('Exercises must be an array.');

  const seenExerciseIds = new Set<string>();
  const normalized = exercises.map((item, index) => {
    if (!item.exercise_id) throw new Error(`Exercise ID is required for exercise ${index + 1}.`);
    if (seenExerciseIds.has(item.exercise_id)) {
      throw new Error('The same exercise cannot appear more than once in a routine.');
    }
    seenExerciseIds.add(item.exercise_id);

    const targetSets = toPositiveInteger(item.target_sets, 3);
    const targetRepsMin = toPositiveInteger(item.target_reps_min, 8);
    const targetRepsMax = toPositiveInteger(item.target_reps_max, 12);
    const restSeconds = toPositiveInteger(item.rest_seconds, 120);
    const orderIndex = toPositiveInteger(item.order_index, index + 1);

    if (!Number.isInteger(targetSets) || targetSets <= 0) {
      throw new Error(`Target sets must be greater than 0 for exercise ${index + 1}.`);
    }
    if (!Number.isInteger(targetRepsMin) || targetRepsMin <= 0) {
      throw new Error(`Minimum target reps must be greater than 0 for exercise ${index + 1}.`);
    }
    if (!Number.isInteger(targetRepsMax) || targetRepsMax < targetRepsMin) {
      throw new Error(`Maximum target reps cannot be lower than minimum target reps for exercise ${index + 1}.`);
    }
    if (!Number.isInteger(restSeconds) || restSeconds <= 0) {
      throw new Error(`Rest time must be greater than 0 for exercise ${index + 1}.`);
    }
    if (!Number.isInteger(orderIndex) || orderIndex <= 0) {
      throw new Error(`Order index must be greater than 0 for exercise ${index + 1}.`);
    }

    return {
      exercise_id: item.exercise_id,
      target_sets: targetSets,
      target_reps_min: targetRepsMin,
      target_reps_max: targetRepsMax,
      rest_seconds: restSeconds,
      notes: item.notes ? String(item.notes).trim() : null,
      order_index: orderIndex,
    };
  });

  if (seenExerciseIds.size > 0) {
    const ids = [...seenExerciseIds];
    const { data, error } = await supabaseAdmin
      .from('exercises')
      .select('id')
      .in('id', ids);

    if (error) throw error;
    const existingIds = new Set((data ?? []).map((row: any) => row.id));
    const missing = ids.filter((id) => !existingIds.has(id));
    if (missing.length > 0) throw new Error(`Exercise not found: ${missing.join(', ')}`);
  }

  return normalized;
};

const getVisibleRoutine = async (routineId: IdParam, userId: string): Promise<any | null> => {
  const id = normalizeIdParam(routineId);
  if (!id) return null;

  const { data, error } = await supabaseAdmin
    .from('workout_routines')
    .select(ROUTINE_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  if (!data.is_global && data.user_id !== userId) return null;
  return sortRoutine(data as any);
};

const getOwnedRoutine = async (routineId: IdParam, userId: string): Promise<any | null> => {
  const id = normalizeIdParam(routineId);
  if (!id) return null;

  const { data, error } = await supabaseAdmin
    .from('workout_routines')
    .select(ROUTINE_SELECT)
    .eq('id', id)
    .eq('user_id', userId)
    .eq('is_global', false)
    .maybeSingle();

  if (error) throw error;
  return sortRoutine(data as any);
};

const cloneRoutineToUser = async (
  sourceRoutineId: IdParam,
  userId: string,
  requestedName?: string,
): Promise<any> => {
  const source = await getVisibleRoutine(sourceRoutineId, userId);
  if (!source) throw new Error('Routine not found or unavailable.');

  const name = String(requestedName || `${source.name} Copy`).trim();
  if (!name) throw new Error('Routine name is required.');

  const { data: routine, error: routineError } = await supabaseAdmin
    .from('workout_routines')
    .insert({
      user_id: userId,
      name,
      description: source.description ?? null,
      cover_image_url: source.cover_image_url ?? null,
      is_global: false,
    })
    .select()
    .single();

  if (routineError) throw routineError;

  const items = (source.routine_exercises ?? []).map((item: any) => ({
    routine_id: routine.id,
    exercise_id: item.exercise_id,
    target_sets: item.target_sets,
    target_reps_min: item.target_reps_min,
    target_reps_max: item.target_reps_max,
    rest_seconds: item.rest_seconds,
    notes: item.notes ?? null,
    order_index: item.order_index,
  }));

  if (items.length > 0) {
    const { error } = await supabaseAdmin.from('routine_exercises').insert(items);
    if (error) {
      await supabaseAdmin.from('workout_routines').delete().eq('id', routine.id).eq('user_id', userId);
      throw error;
    }
  }

  const result = await getOwnedRoutine(routine.id, userId);
  if (!result) throw new Error('Failed to load duplicated routine.');
  return result;
};

const validateSplitDays = async (days: SplitDayInput[], userId: string): Promise<Array<Record<string, unknown>>> => {
  if (!Array.isArray(days)) throw new Error('Days must be an array.');

  const seenDays = new Set<number>();
  const routineIds = new Set<string>();

  const normalized = days.map((item, index) => {
    const dayOfWeek = Number(item.day_of_week);
    const isRestDay = Boolean(item.is_rest_day);
    const routineId = item.routine_id || null;
    const orderIndex = toPositiveInteger(item.order_index, index + 1);

    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      throw new Error(`day_of_week must be between 0 and 6 for day ${index + 1}.`);
    }
    if (seenDays.has(dayOfWeek)) throw new Error(`Day ${dayOfWeek} appears more than once in the split.`);
    seenDays.add(dayOfWeek);

    if (isRestDay && routineId) throw new Error(`Rest day ${dayOfWeek} cannot have a routine.`);
    if (!isRestDay && !routineId) throw new Error(`Workout day ${dayOfWeek} requires a routine.`);
    if (!Number.isInteger(orderIndex) || orderIndex <= 0) throw new Error(`Invalid order index for day ${dayOfWeek}.`);

    if (routineId) routineIds.add(routineId);

    return {
      day_of_week: dayOfWeek,
      routine_id: isRestDay ? null : routineId,
      is_rest_day: isRestDay,
      order_index: orderIndex,
    };
  });

  for (const routineId of routineIds) {
    const routine = await getVisibleRoutine(routineId, userId);
    if (!routine) throw new Error(`Routine ${routineId} was not found or is unavailable.`);
  }

  return normalized;
};

const fetchRoutinesByIds = async (routineIds: string[]): Promise<Map<string, any>> => {
  if (routineIds.length === 0) return new Map();

  const { data, error } = await supabaseAdmin
    .from('workout_routines')
    .select(ROUTINE_SELECT)
    .in('id', [...new Set(routineIds)]);

  if (error) throw error;
  const map = new Map<string, any>();
  for (const row of data ?? []) map.set(row.id, sortRoutine(row as any));
  return map;
};

const getSplitDetails = async (splitId: IdParam, userId: string): Promise<any | null> => {
  const id = normalizeIdParam(splitId);
  if (!id) return null;

  const { data: split, error: splitError } = await supabaseAdmin
    .from('workout_splits')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (splitError) throw splitError;
  if (!split) return null;

  const { data: days, error: daysError } = await supabaseAdmin
    .from('workout_split_days')
    .select('*')
    .eq('split_id', id)
    .order('order_index', { ascending: true });

  if (daysError) throw daysError;
  const routineIds = (days ?? []).flatMap((day: any) => (day.routine_id ? [day.routine_id] : []));
  const routines = await fetchRoutinesByIds(routineIds);

  return {
    ...split,
    days: (days ?? []).map((day: any) => ({ ...day, routine: day.routine_id ? routines.get(day.routine_id) ?? null : null })),
  };
};

const getSessionBase = async (sessionId: IdParam, userId: string): Promise<any | null> => {
  const id = normalizeIdParam(sessionId);
  if (!id) return null;

  const { data, error } = await supabaseAdmin
    .from('workout_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
};

const fetchSessionSets = async (sessionId: IdParam): Promise<any[]> => {
  const id = normalizeIdParam(sessionId);
  if (!id) return [];

  const { data, error } = await supabaseAdmin
    .from('workout_sets')
    .select(`
      id,
      session_id,
      exercise_id,
      set_number,
      weight_kg,
      reps,
      set_type,
      is_completed,
      created_at,
      completed_at,
      exercises (id, name, category, equipment, difficulty, image_url)
    `)
    .eq('session_id', id)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).sort((a: any, b: any) => {
    if (a.exercise_id === b.exercise_id) return Number(a.set_number) - Number(b.set_number);
    return String(a.created_at).localeCompare(String(b.created_at));
  });
};

const calculateTotalVolume = (sets: any[]): number =>
  sets
    .filter((set) => set.is_completed !== false)
    .reduce((sum, set) => sum + Number(set.weight_kg ?? 0) * Number(set.reps ?? 0), 0);

const buildWorkoutProgress = (routine: any | null, sets: any[]) => {
  const completedSets = sets.filter((set) => set.is_completed !== false);
  const routineExercises = routine?.routine_exercises ?? [];
  const plannedSets = routineExercises.reduce(
    (sum: number, item: any) => sum + Number(item.target_sets ?? 0),
    0,
  );

  const exerciseProgress = routineExercises.map((item: any) => {
    const exerciseSets = completedSets.filter((set) => set.exercise_id === item.exercise_id);
    const completedCount = exerciseSets.length;
    const targetSets = Number(item.target_sets ?? 0);
    return {
      routine_exercise_id: item.id,
      exercise_id: item.exercise_id,
      exercise: item.exercises ?? null,
      target_sets: targetSets,
      completed_sets: completedCount,
      is_complete: targetSets > 0 && completedCount >= targetSets,
      next_set_number: completedCount < targetSets ? completedCount + 1 : null,
      target_reps_min: item.target_reps_min,
      target_reps_max: item.target_reps_max,
      rest_seconds: item.rest_seconds,
      notes: item.notes ?? null,
      order_index: item.order_index,
    };
  });

  const completedExercises = exerciseProgress.filter((item: any) => item.is_complete).length;
  const currentExercise = exerciseProgress.find((item: any) => !item.is_complete) ?? null;
  const percentage = plannedSets > 0 ? Math.min(100, Math.round((completedSets.length / plannedSets) * 100)) : 0;

  return {
    planned_exercises: routineExercises.length,
    completed_exercises: completedExercises,
    planned_sets: plannedSets,
    completed_sets: completedSets.length,
    percentage,
    current_exercise: currentExercise,
    exercise_progress: exerciseProgress,
  };
};

const buildSessionDetails = async (session: any, userId: string): Promise<any> => {
  const routine = session.routine_id ? await getVisibleRoutine(session.routine_id, userId) : null;
  const sets = await fetchSessionSets(session.id);
  const progress = buildWorkoutProgress(routine, sets);
  return { ...session, routine, sets, progress };
};

const updateSessionVolume = async (sessionId: IdParam): Promise<number> => {
  const id = normalizeIdParam(sessionId);
  if (!id) return 0;

  const sets = await fetchSessionSets(id);
  const total = calculateTotalVolume(sets);
  const { error } = await supabaseAdmin
    .from('workout_sessions')
    .update({ total_volume_kg: total })
    .eq('id', id);
  if (error) throw error;
  return total;
};

const resolveTodayWorkout = async (userId: string, dayOfWeek: number): Promise<any> => {
  const { data: split, error: splitError } = await supabaseAdmin
    .from('workout_splits')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (splitError) throw splitError;
  if (!split) return { split: null, split_day: null, routine: null, scheduled: false, is_rest_day: false };

  const { data: day, error: dayError } = await supabaseAdmin
    .from('workout_split_days')
    .select('*')
    .eq('split_id', split.id)
    .eq('day_of_week', dayOfWeek)
    .maybeSingle();

  if (dayError) throw dayError;
  if (!day) return { split, split_day: null, routine: null, scheduled: false, is_rest_day: false };

  const routine = day.routine_id ? await getVisibleRoutine(day.routine_id, userId) : null;
  return {
    split,
    split_day: day,
    routine,
    scheduled: true,
    is_rest_day: Boolean(day.is_rest_day),
  };
};

// -----------------------------------------------------------------------------
// Exercise library
// -----------------------------------------------------------------------------

export const getExercises = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('exercises')
      .select('id, name, category, equipment, difficulty, instructions, image_url, created_at')
      .order('name', { ascending: true });

    if (error) throw error;
    res.status(200).json({ success: true, data: data ?? [] });
  } catch (error) {
    console.error('getExercises error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to fetch exercises.') });
  }
};

export const createExercise = async (req: Request, res: Response): Promise<void> => {
  let filePath: string | null = null;

  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const { name, category, equipment, difficulty, instructions } = req.body;
    const cleanName = String(name || '').trim();
    if (!cleanName || !category || !equipment) {
      res.status(400).json({ success: false, message: 'Name, category, and equipment are required.' });
      return;
    }

    let parsedInstructions: string[] = [];
    if (instructions) {
      try {
        parsedInstructions = typeof instructions === 'string' ? JSON.parse(instructions) : instructions;
        if (!Array.isArray(parsedInstructions) || !parsedInstructions.every((item) => typeof item === 'string')) {
          res.status(400).json({ success: false, message: 'Instructions must be an array of strings.' });
          return;
        }
      } catch {
        res.status(400).json({ success: false, message: 'Instructions must be a valid JSON array.' });
        return;
      }
    }

    let imageUrl: string | null = null;
    if (req.file) {
      const ext = req.file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
      filePath = `exercises/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('exercise-images')
        .upload(filePath, req.file.buffer, { contentType: req.file.mimetype, upsert: false });

      if (uploadError) throw uploadError;
      imageUrl = supabaseAdmin.storage.from('exercise-images').getPublicUrl(filePath).data.publicUrl;
    }

    const { data, error } = await supabaseAdmin
      .from('exercises')
      .insert({
        name: cleanName,
        category: String(category).trim(),
        equipment: String(equipment).trim(),
        difficulty: String(difficulty || 'beginner').trim(),
        instructions: parsedInstructions,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) {
      if (filePath) await supabaseAdmin.storage.from('exercise-images').remove([filePath]);
      if (error.code === '23505') {
        res.status(409).json({ success: false, message: 'An exercise with this name already exists.' });
        return;
      }
      throw error;
    }

    res.status(201).json({ success: true, message: 'Exercise added successfully.', data });
  } catch (error) {
    if (filePath) await supabaseAdmin.storage.from('exercise-images').remove([filePath]);
    console.error('createExercise error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to create exercise.') });
  }
};

export const getPreviousPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const { exerciseId } = req.params;
    let query = supabaseAdmin
      .from('workout_sets')
      .select(`
        id, session_id, exercise_id, set_number, weight_kg, reps, set_type, completed_at,
        workout_sessions!inner(id, user_id, workout_date, status, started_at, completed_at)
      `)
      .eq('exercise_id', exerciseId)
      .eq('is_completed', true)
      .eq('workout_sessions.user_id', userId)
      .eq('workout_sessions.status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(100);

    const excludeSessionId = String(req.query.exclude_session_id || '').trim();
    if (excludeSessionId) query = query.neq('session_id', excludeSessionId);

    const { data, error } = await query;
    if (error) throw error;

    if (!data || data.length === 0) {
      res.status(200).json({ success: true, data: null });
      return;
    }

    const latestSessionId = (data[0] as any).session_id;
    const sameSessionSets = (data as any[])
      .filter((row) => row.session_id === latestSessionId)
      .sort((a, b) => Number(a.set_number) - Number(b.set_number));

    res.status(200).json({
      success: true,
      data: {
        session: (sameSessionSets[0] as any).workout_sessions,
        sets: sameSessionSets.map(({ workout_sessions, ...set }) => set),
      },
    });
  } catch (error) {
    console.error('getPreviousPerformance error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to fetch previous performance.') });
  }
};

// -----------------------------------------------------------------------------
// Routines
// -----------------------------------------------------------------------------

export const getRoutines = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const { data, error } = await supabaseAdmin
      .from('workout_routines')
      .select(ROUTINE_SELECT)
      .or(`is_global.eq.true,user_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, data: (data ?? []).map((row: any) => sortRoutine(row)) });
  } catch (error) {
    console.error('getRoutines error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to fetch routines.') });
  }
};

export const getRoutine = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const routine = await getVisibleRoutine(req.params.routineId, userId);
    if (!routine) {
      res.status(404).json({ success: false, message: 'Routine not found.' });
      return;
    }

    res.status(200).json({ success: true, data: routine });
  } catch (error) {
    console.error('getRoutine error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to fetch routine.') });
  }
};

export const createCustomRoutine = async (req: Request, res: Response): Promise<void> => {
  let createdRoutineId: string | null = null;

  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const { name, description, cover_image_url, exercises = [] } = req.body as {
      name: string;
      description?: string;
      cover_image_url?: string;
      exercises?: RoutineExerciseInput[];
    };

    const cleanName = String(name || '').trim();
    if (!cleanName) {
      res.status(400).json({ success: false, message: 'Routine name is required.' });
      return;
    }
    if (!Array.isArray(exercises)) {
      res.status(400).json({ success: false, message: 'Exercises must be an array.' });
      return;
    }

    const normalizedExercises = await validateRoutineExerciseInputs(exercises);

    const { data: routine, error: routineError } = await supabaseAdmin
      .from('workout_routines')
      .insert({
        user_id: userId,
        name: cleanName,
        description: description ? String(description).trim() : null,
        cover_image_url: cover_image_url || null,
        is_global: false,
      })
      .select()
      .single();

    if (routineError) throw routineError;
    createdRoutineId = routine.id;

    if (normalizedExercises.length > 0) {
      const payload = normalizedExercises.map((item) => ({ ...item, routine_id: routine.id }));
      const { error } = await supabaseAdmin.from('routine_exercises').insert(payload);
      if (error) throw error;
    }

    const completeRoutine = await getOwnedRoutine(routine.id, userId);
    res.status(201).json({ success: true, message: 'Routine created successfully.', data: completeRoutine });
  } catch (error) {
    if (createdRoutineId) {
      await supabaseAdmin.from('workout_routines').delete().eq('id', createdRoutineId);
    }
    console.error('createCustomRoutine error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to create routine.') });
  }
};

export const updateCustomRoutine = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const { routineId } = req.params;
    const current = await getOwnedRoutine(routineId, userId);
    if (!current) {
      res.status(404).json({ success: false, message: 'Custom routine not found.' });
      return;
    }

    const { name, description, cover_image_url, exercises } = req.body as {
      name?: string;
      description?: string | null;
      cover_image_url?: string | null;
      exercises?: RoutineExerciseInput[];
    };

    const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name !== undefined) {
      const cleanName = String(name).trim();
      if (!cleanName) {
        res.status(400).json({ success: false, message: 'Routine name cannot be empty.' });
        return;
      }
      updatePayload.name = cleanName;
    }
    if (description !== undefined) updatePayload.description = description ? String(description).trim() : null;
    if (cover_image_url !== undefined) updatePayload.cover_image_url = cover_image_url || null;

    let normalizedExercises: Array<Record<string, unknown>> | null = null;
    if (exercises !== undefined) normalizedExercises = await validateRoutineExerciseInputs(exercises);

    const { error: updateError } = await supabaseAdmin
      .from('workout_routines')
      .update(updatePayload)
      .eq('id', routineId)
      .eq('user_id', userId)
      .eq('is_global', false);
    if (updateError) throw updateError;

    if (normalizedExercises !== null) {
      const oldExercises = (current.routine_exercises ?? []).map((item: any) => ({
        routine_id: routineId,
        exercise_id: item.exercise_id,
        target_sets: item.target_sets,
        target_reps_min: item.target_reps_min,
        target_reps_max: item.target_reps_max,
        rest_seconds: item.rest_seconds,
        notes: item.notes ?? null,
        order_index: item.order_index,
      }));

      const { error: deleteError } = await supabaseAdmin
        .from('routine_exercises')
        .delete()
        .eq('routine_id', routineId);
      if (deleteError) throw deleteError;

      if (normalizedExercises.length > 0) {
        const { error: insertError } = await supabaseAdmin
          .from('routine_exercises')
          .insert(normalizedExercises.map((item) => ({ ...item, routine_id: routineId })));

        if (insertError) {
          if (oldExercises.length > 0) await supabaseAdmin.from('routine_exercises').insert(oldExercises);
          throw insertError;
        }
      }
    }

    const updated = await getOwnedRoutine(routineId, userId);
    res.status(200).json({ success: true, message: 'Routine updated successfully.', data: updated });
  } catch (error) {
    console.error('updateCustomRoutine error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to update routine.') });
  }
};

export const duplicateRoutine = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const duplicated = await cloneRoutineToUser(req.params.routineId, userId, req.body?.name);
    res.status(201).json({ success: true, message: 'Routine duplicated successfully.', data: duplicated });
  } catch (error) {
    console.error('duplicateRoutine error:', error);
    const message = errorMessage(error, 'Failed to duplicate routine.');
    res.status(message.includes('not found') || message.includes('unavailable') ? 404 : 500).json({ success: false, message });
  }
};

export const deleteCustomRoutine = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const { routineId } = req.params;
    const routine = await getOwnedRoutine(routineId, userId);
    if (!routine) {
      res.status(404).json({ success: false, message: 'Custom routine not found.' });
      return;
    }

    const { count, error: usageError } = await supabaseAdmin
      .from('workout_split_days')
      .select('id', { count: 'exact', head: true })
      .eq('routine_id', routineId);
    if (usageError) throw usageError;

    if ((count ?? 0) > 0) {
      res.status(409).json({
        success: false,
        message: 'This routine is still used by a workout split. Remove or replace it from the split before deleting it.',
      });
      return;
    }

    const { error } = await supabaseAdmin
      .from('workout_routines')
      .delete()
      .eq('id', routineId)
      .eq('user_id', userId)
      .eq('is_global', false);
    if (error) throw error;

    res.status(200).json({ success: true, message: 'Routine deleted successfully.' });
  } catch (error) {
    console.error('deleteCustomRoutine error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to delete routine.') });
  }
};

// -----------------------------------------------------------------------------
// Workout splits
// -----------------------------------------------------------------------------

export const getSplits = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const { data: splits, error } = await supabaseAdmin
      .from('workout_splits')
      .select('*')
      .eq('user_id', userId)
      .order('is_active', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;

    const detailed = await Promise.all((splits ?? []).map((split: any) => getSplitDetails(split.id, userId)));
    res.status(200).json({ success: true, data: detailed.filter(Boolean) });
  } catch (error) {
    console.error('getSplits error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to fetch workout splits.') });
  }
};

export const getSplit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const split = await getSplitDetails(req.params.splitId, userId);
    if (!split) {
      res.status(404).json({ success: false, message: 'Workout split not found.' });
      return;
    }

    res.status(200).json({ success: true, data: split });
  } catch (error) {
    console.error('getSplit error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to fetch workout split.') });
  }
};

export const createSplit = async (req: Request, res: Response): Promise<void> => {
  let createdSplitId: string | null = null;

  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const { name, description, is_active = false, days = [] } = req.body as {
      name: string;
      description?: string;
      is_active?: boolean;
      days?: SplitDayInput[];
    };

    const cleanName = String(name || '').trim();
    if (!cleanName) {
      res.status(400).json({ success: false, message: 'Split name is required.' });
      return;
    }

    const normalizedDays = await validateSplitDays(days, userId);

    if (is_active) {
      const { error } = await supabaseAdmin
        .from('workout_splits')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_active', true);
      if (error) throw error;
    }

    const { data: split, error: splitError } = await supabaseAdmin
      .from('workout_splits')
      .insert({
        user_id: userId,
        name: cleanName,
        description: description ? String(description).trim() : null,
        is_active: Boolean(is_active),
      })
      .select()
      .single();
    if (splitError) throw splitError;
    createdSplitId = split.id;

    if (normalizedDays.length > 0) {
      const { error: daysError } = await supabaseAdmin
        .from('workout_split_days')
        .insert(normalizedDays.map((day) => ({ ...day, split_id: split.id })));
      if (daysError) throw daysError;
    }

    const complete = await getSplitDetails(split.id, userId);
    res.status(201).json({ success: true, message: 'Workout split created successfully.', data: complete });
  } catch (error) {
    if (createdSplitId) await supabaseAdmin.from('workout_splits').delete().eq('id', createdSplitId);
    console.error('createSplit error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to create workout split.') });
  }
};

export const updateSplit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const { splitId } = req.params;
    const current = await getSplitDetails(splitId, userId);
    if (!current) {
      res.status(404).json({ success: false, message: 'Workout split not found.' });
      return;
    }

    const { name, description, is_active, days } = req.body as {
      name?: string;
      description?: string | null;
      is_active?: boolean;
      days?: SplitDayInput[];
    };

    const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name !== undefined) {
      const cleanName = String(name).trim();
      if (!cleanName) {
        res.status(400).json({ success: false, message: 'Split name cannot be empty.' });
        return;
      }
      updatePayload.name = cleanName;
    }
    if (description !== undefined) updatePayload.description = description ? String(description).trim() : null;
    if (is_active !== undefined) updatePayload.is_active = Boolean(is_active);

    let normalizedDays: Array<Record<string, unknown>> | null = null;
    if (days !== undefined) normalizedDays = await validateSplitDays(days, userId);

    if (is_active === true) {
      const { error } = await supabaseAdmin
        .from('workout_splits')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .neq('id', splitId)
        .eq('is_active', true);
      if (error) throw error;
    }

    const { error: splitError } = await supabaseAdmin
      .from('workout_splits')
      .update(updatePayload)
      .eq('id', splitId)
      .eq('user_id', userId);
    if (splitError) throw splitError;

    if (normalizedDays !== null) {
      const oldDays = (current.days ?? []).map((day: any) => ({
        split_id: splitId,
        day_of_week: day.day_of_week,
        routine_id: day.routine_id,
        is_rest_day: day.is_rest_day,
        order_index: day.order_index,
      }));

      const { error: deleteError } = await supabaseAdmin
        .from('workout_split_days')
        .delete()
        .eq('split_id', splitId);
      if (deleteError) throw deleteError;

      if (normalizedDays.length > 0) {
        const { error: insertError } = await supabaseAdmin
          .from('workout_split_days')
          .insert(normalizedDays.map((day) => ({ ...day, split_id: splitId })));
        if (insertError) {
          if (oldDays.length > 0) await supabaseAdmin.from('workout_split_days').insert(oldDays);
          throw insertError;
        }
      }
    }

    const updated = await getSplitDetails(splitId, userId);
    res.status(200).json({ success: true, message: 'Workout split updated successfully.', data: updated });
  } catch (error) {
    console.error('updateSplit error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to update workout split.') });
  }
};

export const activateSplit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const split = await getSplitDetails(req.params.splitId, userId);
    if (!split) {
      res.status(404).json({ success: false, message: 'Workout split not found.' });
      return;
    }

    const now = new Date().toISOString();
    const { error: deactivateError } = await supabaseAdmin
      .from('workout_splits')
      .update({ is_active: false, updated_at: now })
      .eq('user_id', userId)
      .eq('is_active', true);
    if (deactivateError) throw deactivateError;

    const { error: activateError } = await supabaseAdmin
      .from('workout_splits')
      .update({ is_active: true, updated_at: now })
      .eq('id', req.params.splitId)
      .eq('user_id', userId);
    if (activateError) throw activateError;

    const updated = await getSplitDetails(req.params.splitId, userId);
    res.status(200).json({ success: true, message: 'Workout split activated.', data: updated });
  } catch (error) {
    console.error('activateSplit error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to activate workout split.') });
  }
};

export const duplicateSplit = async (req: Request, res: Response): Promise<void> => {
  let createdSplitId: string | null = null;

  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const source = await getSplitDetails(req.params.splitId, userId);
    if (!source) {
      res.status(404).json({ success: false, message: 'Workout split not found.' });
      return;
    }

    const name = String(req.body?.name || `${source.name} Copy`).trim();
    const { data: split, error } = await supabaseAdmin
      .from('workout_splits')
      .insert({ user_id: userId, name, description: source.description ?? null, is_active: false })
      .select()
      .single();
    if (error) throw error;
    createdSplitId = split.id;

    const daysPayload = (source.days ?? []).map((day: any) => ({
      split_id: split.id,
      day_of_week: day.day_of_week,
      routine_id: day.routine_id,
      is_rest_day: day.is_rest_day,
      order_index: day.order_index,
    }));

    if (daysPayload.length > 0) {
      const { error: daysError } = await supabaseAdmin.from('workout_split_days').insert(daysPayload);
      if (daysError) throw daysError;
    }

    const complete = await getSplitDetails(split.id, userId);
    res.status(201).json({ success: true, message: 'Workout split duplicated successfully.', data: complete });
  } catch (error) {
    if (createdSplitId) await supabaseAdmin.from('workout_splits').delete().eq('id', createdSplitId);
    console.error('duplicateSplit error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to duplicate workout split.') });
  }
};

export const duplicateSplitDay = async (req: Request, res: Response): Promise<void> => {
  let clonedRoutineId: string | null = null;

  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const { splitId, dayId } = req.params;
    const targetDay = Number(req.body?.target_day_of_week);
    if (!Number.isInteger(targetDay) || targetDay < 0 || targetDay > 6) {
      res.status(400).json({ success: false, message: 'target_day_of_week must be between 0 and 6.' });
      return;
    }

    const split = await getSplitDetails(splitId, userId);
    if (!split) {
      res.status(404).json({ success: false, message: 'Workout split not found.' });
      return;
    }

    const sourceDay = (split.days ?? []).find((day: any) => day.id === dayId);
    if (!sourceDay) {
      res.status(404).json({ success: false, message: 'Workout day not found.' });
      return;
    }
    if ((split.days ?? []).some((day: any) => Number(day.day_of_week) === targetDay)) {
      res.status(409).json({ success: false, message: 'The target day already exists in this split.' });
      return;
    }

    let routineId: string | null = null;
    if (!sourceDay.is_rest_day && sourceDay.routine_id) {
      const cloned = await cloneRoutineToUser(sourceDay.routine_id, userId, req.body?.routine_name);
      clonedRoutineId = cloned.id;
      routineId = cloned.id;
    }

    const { data, error } = await supabaseAdmin
      .from('workout_split_days')
      .insert({
        split_id: splitId,
        day_of_week: targetDay,
        routine_id: routineId,
        is_rest_day: Boolean(sourceDay.is_rest_day),
        order_index: Number(req.body?.order_index ?? targetDay + 1),
      })
      .select()
      .single();
    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Workout day duplicated successfully.',
      data: { ...data, routine: routineId ? await getOwnedRoutine(routineId, userId) : null },
    });
  } catch (error) {
    if (clonedRoutineId) await supabaseAdmin.from('workout_routines').delete().eq('id', clonedRoutineId);
    console.error('duplicateSplitDay error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to duplicate workout day.') });
  }
};

export const deleteSplit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const split = await getSplitDetails(req.params.splitId, userId);
    if (!split) {
      res.status(404).json({ success: false, message: 'Workout split not found.' });
      return;
    }

    const { error } = await supabaseAdmin
      .from('workout_splits')
      .delete()
      .eq('id', req.params.splitId)
      .eq('user_id', userId);
    if (error) throw error;

    res.status(200).json({ success: true, message: 'Workout split deleted successfully.' });
  } catch (error) {
    console.error('deleteSplit error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to delete workout split.') });
  }
};

// -----------------------------------------------------------------------------
// Workout home / today's workout
// -----------------------------------------------------------------------------

export const getTodayWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const raw = req.query.day_of_week;
    const dayOfWeek = raw === undefined ? new Date().getDay() : Number(raw);
    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      res.status(400).json({ success: false, message: 'day_of_week must be between 0 and 6.' });
      return;
    }

    const today = await resolveTodayWorkout(userId, dayOfWeek);
    res.status(200).json({ success: true, data: { day_of_week: dayOfWeek, ...today } });
  } catch (error) {
    console.error('getTodayWorkout error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, "Failed to fetch today's workout.") });
  }
};

export const getWorkoutOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const raw = req.query.day_of_week;
    const dayOfWeek = raw === undefined ? new Date().getDay() : Number(raw);
    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      res.status(400).json({ success: false, message: 'day_of_week must be between 0 and 6.' });
      return;
    }

    const [today, activeResult, recentResult] = await Promise.all([
      resolveTodayWorkout(userId, dayOfWeek),
      supabaseAdmin
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'in_progress')
        .maybeSingle(),
      supabaseAdmin
        .from('workout_sessions')
        .select('id, routine_id, workout_date, notes, total_volume_kg, status, started_at, completed_at, created_at, workout_routines(id, name)')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('workout_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    if (activeResult.error) throw activeResult.error;
    if (recentResult.error) throw recentResult.error;

    const activeSession = activeResult.data ? await buildSessionDetails(activeResult.data, userId) : null;

    res.status(200).json({
      success: true,
      data: {
        day_of_week: dayOfWeek,
        today,
        active_session: activeSession,
        recent_workouts: recentResult.data ?? [],
      },
    });
  } catch (error) {
    console.error('getWorkoutOverview error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to fetch workout overview.') });
  }
};

// -----------------------------------------------------------------------------
// Active workout sessions
// -----------------------------------------------------------------------------

export const getActiveWorkoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const { data, error } = await supabaseAdmin
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .maybeSingle();
    if (error) throw error;

    if (!data) {
      res.status(200).json({ success: true, data: null });
      return;
    }

    res.status(200).json({ success: true, data: await buildSessionDetails(data, userId) });
  } catch (error) {
    console.error('getActiveWorkoutSession error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to fetch active workout.') });
  }
};

export const startWorkoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const { data: active, error: activeError } = await supabaseAdmin
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .maybeSingle();
    if (activeError) throw activeError;

    if (active) {
      res.status(200).json({
        success: true,
        message: 'An active workout already exists. Resuming it instead.',
        data: await buildSessionDetails(active, userId),
      });
      return;
    }

    let routineId: string | null = req.body?.routine_id || null;
    let splitId: string | null = req.body?.split_id || null;
    let splitDayId: string | null = req.body?.split_day_id || null;

    if (splitDayId) {
      const { data: day, error } = await supabaseAdmin
        .from('workout_split_days')
        .select('*, workout_splits!inner(id, user_id)')
        .eq('id', splitDayId)
        .eq('workout_splits.user_id', userId)
        .maybeSingle();
      if (error) throw error;
      if (!day) {
        res.status(404).json({ success: false, message: 'Workout split day not found.' });
        return;
      }
      if (day.is_rest_day || !day.routine_id) {
        res.status(400).json({ success: false, message: 'A rest day cannot be started as a workout.' });
        return;
      }
      routineId = day.routine_id;
      splitId = (day as any).workout_splits.id;
    }

    if (!routineId) {
      const dayOfWeek = Number(req.body?.day_of_week ?? new Date().getDay());
      if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
        res.status(400).json({ success: false, message: 'day_of_week must be between 0 and 6.' });
        return;
      }
      const today = await resolveTodayWorkout(userId, dayOfWeek);
      if (!today.scheduled || today.is_rest_day || !today.routine) {
        res.status(400).json({ success: false, message: 'There is no workout scheduled for this day.' });
        return;
      }
      routineId = today.routine.id;
      splitId = today.split?.id ?? null;
      splitDayId = today.split_day?.id ?? null;
    }

    const routine = await getVisibleRoutine(routineId, userId);
    if (!routine) {
      res.status(404).json({ success: false, message: 'Routine not found or unavailable.' });
      return;
    }
    if ((routine.routine_exercises ?? []).length === 0) {
      res.status(400).json({ success: false, message: 'This routine has no exercises yet.' });
      return;
    }

    if (splitId) {
      const split = await getSplitDetails(splitId, userId);
      if (!split) {
        res.status(404).json({ success: false, message: 'Workout split not found.' });
        return;
      }
    }

    const now = new Date().toISOString();
    const { data: session, error } = await supabaseAdmin
      .from('workout_sessions')
      .insert({
        user_id: userId,
        routine_id: routineId,
        split_id: splitId,
        split_day_id: splitDayId,
        workout_date: req.body?.workout_date || now.slice(0, 10),
        notes: req.body?.notes ? String(req.body.notes).trim() : null,
        total_volume_kg: 0,
        status: 'in_progress',
        started_at: now,
        completed_at: null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        const { data: existing } = await supabaseAdmin
          .from('workout_sessions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'in_progress')
          .maybeSingle();
        if (existing) {
          res.status(200).json({ success: true, message: 'Active workout resumed.', data: await buildSessionDetails(existing, userId) });
          return;
        }
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Workout started.',
      data: await buildSessionDetails(session, userId),
    });
  } catch (error) {
    console.error('startWorkoutSession error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to start workout.') });
  }
};

export const getWorkoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const session = await getSessionBase(req.params.sessionId, userId);
    if (!session) {
      res.status(404).json({ success: false, message: 'Workout session not found.' });
      return;
    }

    res.status(200).json({ success: true, data: await buildSessionDetails(session, userId) });
  } catch (error) {
    console.error('getWorkoutSession error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to fetch workout session.') });
  }
};

export const logWorkoutSet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const { sessionId } = req.params;
    const session = await getSessionBase(sessionId, userId);
    if (!session) {
      res.status(404).json({ success: false, message: 'Workout session not found.' });
      return;
    }
    if (session.status !== 'in_progress') {
      res.status(409).json({ success: false, message: 'Sets can only be logged to an in-progress workout.' });
      return;
    }

    const { exercise_id, set_number, weight_kg = 0, reps = 0, set_type = 'working' } = req.body as WorkoutSetInput;
    const setNumber = Number(set_number);
    const weight = Number(weight_kg);
    const repCount = Number(reps);

    if (!exercise_id) {
      res.status(400).json({ success: false, message: 'exercise_id is required.' });
      return;
    }
    if (!Number.isInteger(setNumber) || setNumber <= 0) {
      res.status(400).json({ success: false, message: 'set_number must be a positive integer.' });
      return;
    }
    if (!Number.isFinite(weight) || weight < 0 || !Number.isInteger(repCount) || repCount < 0) {
      res.status(400).json({ success: false, message: 'Weight and reps cannot be negative.' });
      return;
    }

    const routine = session.routine_id ? await getVisibleRoutine(session.routine_id, userId) : null;
    const routineExercise = routine?.routine_exercises?.find((item: any) => item.exercise_id === exercise_id) ?? null;
    if (routine && !routineExercise) {
      res.status(400).json({ success: false, message: 'This exercise is not part of the active routine.' });
      return;
    }
    if (routineExercise && setNumber > Number(routineExercise.target_sets)) {
      res.status(400).json({ success: false, message: `This exercise only has ${routineExercise.target_sets} planned sets.` });
      return;
    }

    const now = new Date().toISOString();
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('workout_sets')
      .select('id')
      .eq('session_id', sessionId)
      .eq('exercise_id', exercise_id)
      .eq('set_number', setNumber)
      .maybeSingle();
    if (existingError) throw existingError;

    let savedSet: any;
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('workout_sets')
        .update({
          weight_kg: weight,
          reps: repCount,
          set_type: String(set_type || 'working'),
          is_completed: true,
          completed_at: now,
        })
        .eq('id', existing.id)
        .eq('session_id', sessionId)
        .select()
        .single();
      if (error) throw error;
      savedSet = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('workout_sets')
        .insert({
          session_id: sessionId,
          exercise_id,
          set_number: setNumber,
          weight_kg: weight,
          reps: repCount,
          set_type: String(set_type || 'working'),
          is_completed: true,
          completed_at: now,
        })
        .select()
        .single();
      if (error) throw error;
      savedSet = data;
    }

    const totalVolume = await updateSessionVolume(sessionId);
    const sets = await fetchSessionSets(sessionId);
    const progress = buildWorkoutProgress(routine, sets);

    const exerciseState = progress.exercise_progress.find((item: any) => item.exercise_id === exercise_id) ?? null;
    const currentIndex = routine?.routine_exercises?.findIndex((item: any) => item.exercise_id === exercise_id) ?? -1;
    const nextRoutineExercise = exerciseState?.is_complete && currentIndex >= 0
      ? routine.routine_exercises.slice(currentIndex + 1).find((item: any) => {
          const state = progress.exercise_progress.find((p: any) => p.exercise_id === item.exercise_id);
          return state && !state.is_complete;
        }) ?? null
      : null;

    const workoutComplete = progress.planned_sets > 0 && progress.completed_sets >= progress.planned_sets;
    const restSeconds = Number(routineExercise?.rest_seconds ?? 120);

    res.status(existing ? 200 : 201).json({
      success: true,
      message: existing ? 'Set updated and saved.' : 'Set completed and saved.',
      data: {
        set: savedSet,
        rest: {
          should_start: !workoutComplete,
          rest_seconds: !workoutComplete ? restSeconds : 0,
          reason: workoutComplete
            ? 'workout_complete'
            : exerciseState?.is_complete
              ? 'before_next_exercise'
              : 'before_next_set',
        },
        exercise: exerciseState,
        next_exercise: nextRoutineExercise
          ? {
              routine_exercise_id: nextRoutineExercise.id,
              exercise_id: nextRoutineExercise.exercise_id,
              exercise: nextRoutineExercise.exercises ?? null,
              target_sets: nextRoutineExercise.target_sets,
              target_reps_min: nextRoutineExercise.target_reps_min,
              target_reps_max: nextRoutineExercise.target_reps_max,
              rest_seconds: nextRoutineExercise.rest_seconds,
              notes: nextRoutineExercise.notes ?? null,
            }
          : null,
        workout: progress,
        total_volume_kg: totalVolume,
      },
    });
  } catch (error) {
    console.error('logWorkoutSet error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to save workout set.') });
  }
};

export const updateWorkoutSet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const { sessionId, setId } = req.params;
    const session = await getSessionBase(sessionId, userId);
    if (!session) {
      res.status(404).json({ success: false, message: 'Workout session not found.' });
      return;
    }
    if (session.status !== 'in_progress') {
      res.status(409).json({ success: false, message: 'Only an in-progress workout can be edited.' });
      return;
    }

    const update: Record<string, unknown> = {};
    if (req.body.weight_kg !== undefined) {
      const weight = Number(req.body.weight_kg);
      if (!Number.isFinite(weight) || weight < 0) {
        res.status(400).json({ success: false, message: 'weight_kg cannot be negative.' });
        return;
      }
      update.weight_kg = weight;
    }
    if (req.body.reps !== undefined) {
      const reps = Number(req.body.reps);
      if (!Number.isInteger(reps) || reps < 0) {
        res.status(400).json({ success: false, message: 'reps must be a non-negative integer.' });
        return;
      }
      update.reps = reps;
    }
    if (req.body.set_type !== undefined) update.set_type = String(req.body.set_type || 'working');
    if (req.body.is_completed !== undefined) {
      update.is_completed = Boolean(req.body.is_completed);
      update.completed_at = req.body.is_completed ? new Date().toISOString() : null;
    }

    if (Object.keys(update).length === 0) {
      res.status(400).json({ success: false, message: 'No set fields were provided to update.' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('workout_sets')
      .update(update)
      .eq('id', setId)
      .eq('session_id', sessionId)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ success: false, message: 'Workout set not found.' });
      return;
    }

    const totalVolume = await updateSessionVolume(sessionId);
    const details = await buildSessionDetails(session, userId);
    res.status(200).json({ success: true, message: 'Workout set updated.', data: { set: data, total_volume_kg: totalVolume, progress: details.progress } });
  } catch (error) {
    console.error('updateWorkoutSet error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to update workout set.') });
  }
};

export const deleteWorkoutSet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const { sessionId, setId } = req.params;
    const session = await getSessionBase(sessionId, userId);
    if (!session) {
      res.status(404).json({ success: false, message: 'Workout session not found.' });
      return;
    }
    if (session.status !== 'in_progress') {
      res.status(409).json({ success: false, message: 'Only an in-progress workout can be edited.' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('workout_sets')
      .delete()
      .eq('id', setId)
      .eq('session_id', sessionId)
      .select('id')
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ success: false, message: 'Workout set not found.' });
      return;
    }

    const totalVolume = await updateSessionVolume(sessionId);
    const details = await buildSessionDetails(session, userId);
    res.status(200).json({ success: true, message: 'Workout set removed.', data: { total_volume_kg: totalVolume, progress: details.progress } });
  } catch (error) {
    console.error('deleteWorkoutSet error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to delete workout set.') });
  }
};

export const getWorkoutProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const session = await getSessionBase(req.params.sessionId, userId);
    if (!session) {
      res.status(404).json({ success: false, message: 'Workout session not found.' });
      return;
    }

    const routine = session.routine_id ? await getVisibleRoutine(session.routine_id, userId) : null;
    const sets = await fetchSessionSets(session.id);
    res.status(200).json({ success: true, data: buildWorkoutProgress(routine, sets) });
  } catch (error) {
    console.error('getWorkoutProgress error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to fetch workout progress.') });
  }
};

export const completeWorkoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const { sessionId } = req.params;
    const session = await getSessionBase(sessionId, userId);
    if (!session) {
      res.status(404).json({ success: false, message: 'Workout session not found.' });
      return;
    }
    if (session.status === 'completed') {
      const details = await buildSessionDetails(session, userId);
      res.status(200).json({ success: true, message: 'Workout is already completed.', data: details });
      return;
    }
    if (session.status !== 'in_progress') {
      res.status(409).json({ success: false, message: 'Only an in-progress workout can be completed.' });
      return;
    }

    const sets = await fetchSessionSets(sessionId);
    if (sets.filter((set) => set.is_completed !== false).length === 0) {
      res.status(400).json({ success: false, message: 'Complete at least one set before finishing the workout.' });
      return;
    }

    const totalVolume = calculateTotalVolume(sets);
    const now = new Date().toISOString();
    const { data: completed, error } = await supabaseAdmin
      .from('workout_sessions')
      .update({
        status: 'completed',
        completed_at: now,
        total_volume_kg: totalVolume,
        notes: req.body?.notes !== undefined ? (req.body.notes ? String(req.body.notes).trim() : null) : session.notes,
      })
      .eq('id', sessionId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;

    const details = await buildSessionDetails(completed, userId);
    const started = new Date(completed.started_at).getTime();
    const ended = new Date(completed.completed_at).getTime();

    res.status(200).json({
      success: true,
      message: 'Workout completed.',
      data: {
        ...details,
        summary: {
          duration_seconds: Math.max(0, Math.round((ended - started) / 1000)),
          exercises_completed: details.progress.completed_exercises,
          exercises_planned: details.progress.planned_exercises,
          sets_completed: details.progress.completed_sets,
          sets_planned: details.progress.planned_sets,
          total_volume_kg: totalVolume,
        },
      },
    });
  } catch (error) {
    console.error('completeWorkoutSession error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to complete workout.') });
  }
};

export const abandonWorkoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const session = await getSessionBase(req.params.sessionId, userId);
    if (!session) {
      res.status(404).json({ success: false, message: 'Workout session not found.' });
      return;
    }
    if (session.status !== 'in_progress') {
      res.status(409).json({ success: false, message: 'Only an in-progress workout can be abandoned.' });
      return;
    }

    const totalVolume = await updateSessionVolume(session.id);
    const { data, error } = await supabaseAdmin
      .from('workout_sessions')
      .update({ status: 'abandoned', total_volume_kg: totalVolume })
      .eq('id', session.id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;

    res.status(200).json({ success: true, message: 'Workout abandoned.', data });
  } catch (error) {
    console.error('abandonWorkoutSession error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to abandon workout.') });
  }
};

// Backward-compatible bulk logger. New active workout UI should use /sessions/start + /sessions/:id/sets.
export const logWorkoutSession = async (req: Request, res: Response): Promise<void> => {
  let createdSessionId: string | null = null;

  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const { routine_id, workout_date, notes, sets } = req.body as {
      routine_id?: string;
      workout_date?: string;
      notes?: string;
      sets?: WorkoutSetInput[];
    };

    if (!sets || !Array.isArray(sets) || sets.length === 0) {
      res.status(400).json({ success: false, message: 'At least one workout set is required.' });
      return;
    }

    if (routine_id) {
      const routine = await getVisibleRoutine(routine_id, userId);
      if (!routine) {
        res.status(404).json({ success: false, message: 'Routine not found or unavailable.' });
        return;
      }
    }

    const seenKeys = new Set<string>();
    for (const [index, item] of sets.entries()) {
      if (!item.exercise_id) {
        res.status(400).json({ success: false, message: `Exercise ID is required for set ${index + 1}.` });
        return;
      }
      const setNumber = Number(item.set_number);
      if (!Number.isInteger(setNumber) || setNumber <= 0) {
        res.status(400).json({ success: false, message: `Invalid set number for set ${index + 1}.` });
        return;
      }
      if (Number(item.weight_kg ?? 0) < 0 || Number(item.reps ?? 0) < 0) {
        res.status(400).json({ success: false, message: `Weight and reps cannot be negative for set ${index + 1}.` });
        return;
      }
      const key = `${item.exercise_id}:${setNumber}`;
      if (seenKeys.has(key)) {
        res.status(400).json({ success: false, message: `Duplicate set ${setNumber} for exercise ${item.exercise_id}.` });
        return;
      }
      seenKeys.add(key);
    }

    const totalVolume = sets.reduce(
      (total, item) => total + Number(item.weight_kg ?? 0) * Number(item.reps ?? 0),
      0,
    );
    const now = new Date().toISOString();

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('workout_sessions')
      .insert({
        user_id: userId,
        routine_id: routine_id || null,
        workout_date: workout_date || now.slice(0, 10),
        notes: notes || null,
        total_volume_kg: totalVolume,
        status: 'completed',
        started_at: now,
        completed_at: now,
      })
      .select()
      .single();
    if (sessionError) throw sessionError;
    createdSessionId = session.id;

    const payload = sets.map((item) => ({
      session_id: session.id,
      exercise_id: item.exercise_id,
      set_number: Number(item.set_number),
      weight_kg: Number(item.weight_kg ?? 0),
      reps: Number(item.reps ?? 0),
      set_type: item.set_type || 'working',
      is_completed: true,
      completed_at: now,
    }));

    const { error: setsError } = await supabaseAdmin.from('workout_sets').insert(payload);
    if (setsError) throw setsError;

    res.status(201).json({
      success: true,
      message: 'Workout logged successfully.',
      data: { session_id: session.id, workout_date: session.workout_date, total_sets: sets.length, total_volume_kg: totalVolume },
    });
  } catch (error) {
    if (createdSessionId) await supabaseAdmin.from('workout_sessions').delete().eq('id', createdSessionId);
    console.error('logWorkoutSession error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to log workout session.') });
  }
};

// -----------------------------------------------------------------------------
// History
// -----------------------------------------------------------------------------

export const getWorkoutHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20) || 20));
    const offset = Math.max(0, Number(req.query.offset ?? 0) || 0);

    let query = supabaseAdmin
      .from('workout_sessions')
      .select(`
        id,
        routine_id,
        split_id,
        split_day_id,
        workout_date,
        notes,
        total_volume_kg,
        status,
        started_at,
        completed_at,
        created_at,
        workout_routines (id, name),
        workout_sets (id, exercise_id, set_number, weight_kg, reps, set_type, is_completed, completed_at, exercises(id, name, category))
      `)
      .eq('user_id', userId)
      .order('workout_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const requestedStatus = String(req.query.status || 'completed').trim();
    if (requestedStatus !== 'all') query = query.eq('status', requestedStatus);

    const { data, error } = await query;
    if (error) throw error;

    res.status(200).json({ success: true, data: data ?? [], pagination: { limit, offset } });
  } catch (error) {
    console.error('getWorkoutHistory error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to fetch workout history.') });
  }
};

export const getWorkoutHistoryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) { sendUnauthorized(res); return; }

    const session = await getSessionBase(req.params.sessionId, userId);
    if (!session || session.status === 'in_progress') {
      res.status(404).json({ success: false, message: 'Workout history item not found.' });
      return;
    }

    const details = await buildSessionDetails(session, userId);
    const endedAt = session.completed_at ? new Date(session.completed_at).getTime() : null;
    const startedAt = session.started_at ? new Date(session.started_at).getTime() : null;

    res.status(200).json({
      success: true,
      data: {
        ...details,
        summary: {
          duration_seconds: endedAt && startedAt ? Math.max(0, Math.round((endedAt - startedAt) / 1000)) : null,
          exercises_completed: details.progress.completed_exercises,
          exercises_planned: details.progress.planned_exercises,
          sets_completed: details.progress.completed_sets,
          sets_planned: details.progress.planned_sets,
          total_volume_kg: Number(session.total_volume_kg ?? calculateTotalVolume(details.sets)),
        },
      },
    });
  } catch (error) {
    console.error('getWorkoutHistoryItem error:', error);
    res.status(500).json({ success: false, message: errorMessage(error, 'Failed to fetch workout history item.') });
  }
};
