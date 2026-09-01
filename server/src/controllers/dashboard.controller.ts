import type { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

const clampPercentage = (consumed: number, target: number): number => target <= 0 ? 0 : Math.round((consumed / target) * 100);
const round1 = (value: number): number => Number(value.toFixed(1));
const round2 = (value: number): number => Number(value.toFixed(2));

const getClientOffsetMinutes = (req: Request): number => {
  const raw = req.header('x-timezone-offset-minutes');
  const parsed = raw ? Number(raw) : 0;
  return (!Number.isFinite(parsed) || parsed < -840 || parsed > 840) ? 0 : parsed;
};

const getDateContext = (offsetMinutes: number) => {
  const now = new Date();
  const shiftedNow = new Date(now.getTime() + offsetMinutes * 60_000);
  const year = shiftedNow.getUTCFullYear(), month = shiftedNow.getUTCMonth(), day = shiftedNow.getUTCDate();
  const localMidnightAsUtcMs = Date.UTC(year, month, day);
  const startOfDayMs = localMidnightAsUtcMs - offsetMinutes * 60_000;
  const endOfDayMs = startOfDayMs + 86_400_000 - 1;
  const dayOfWeek = shiftedNow.getUTCDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStartLocalMs = localMidnightAsUtcMs - daysFromMonday * 86_400_000;
  const weekEndLocalMs = weekStartLocalMs + 6 * 86_400_000;
  const monthStartLocalMs = Date.UTC(year, month, 1), nextMonthStartLocalMs = Date.UTC(year, month + 1, 1);
  const toLocalDateString = (localMs: number) => new Date(localMs).toISOString().slice(0, 10);
  const localBoundaryToUtcIso = (localMs: number) => new Date(localMs - offsetMinutes * 60_000).toISOString();
  return {
    year, month: month + 1, todayDate: toLocalDateString(localMidnightAsUtcMs),
    startOfDayIso: new Date(startOfDayMs).toISOString(), endOfDayIso: new Date(endOfDayMs).toISOString(),
    weekStartDate: toLocalDateString(weekStartLocalMs), weekEndDate: toLocalDateString(weekEndLocalMs),
    monthStartDate: toLocalDateString(monthStartLocalMs), monthEndDate: toLocalDateString(nextMonthStartLocalMs - 86_400_000),
    monthStartIso: localBoundaryToUtcIso(monthStartLocalMs), nextMonthStartIso: localBoundaryToUtcIso(nextMonthStartLocalMs),
  };
};

const buildNutritionMetric = (consumed: number, target: number) => {
  const normalizedConsumed = round1(consumed), normalizedTarget = round1(target), difference = round1(normalizedTarget - normalizedConsumed);
  return { consumed: normalizedConsumed, target: normalizedTarget, remaining: Math.max(0, difference), exceeded: Math.max(0, round1(-difference)), percentage: clampPercentage(normalizedConsumed, normalizedTarget) };
};

export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ success: false, error: 'Unauthorized', message: 'User ID missing' }); return; }
    const offsetMinutes = getClientOffsetMinutes(req), date = getDateContext(offsetMinutes);
    const [profileRes, todayMealsRes, todayWorkoutsRes, weekWorkoutsRes, monthWorkoutsRes, monthMealsRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('full_name, avatar_url, primary_goal, streak_count, workout_days_per_week, is_onboarded, daily_calories, protein_grams, carbs_grams, fat_grams').eq('id', userId).single(),
      supabaseAdmin.from('meal_logs').select('id, meal_type, raw_input_prompt, total_calories, total_protein, total_carbs, total_fat, food_items, logged_at').eq('user_id', userId).gte('logged_at', date.startOfDayIso).lte('logged_at', date.endOfDayIso).order('logged_at', { ascending: false }),
      supabaseAdmin.from('workout_sessions').select(`id, routine_id, workout_date, notes, total_volume_kg, created_at, workout_routines (id, name, description, cover_image_url), workout_sets (id, exercise_id, set_number, weight_kg, reps, is_completed)`).eq('user_id', userId).eq('workout_date', date.todayDate).order('created_at', { ascending: false }),
      supabaseAdmin.from('workout_sessions').select('id, routine_id, workout_date, total_volume_kg').eq('user_id', userId).gte('workout_date', date.weekStartDate).lte('workout_date', date.weekEndDate),
      supabaseAdmin.from('workout_sessions').select('workout_date').eq('user_id', userId).gte('workout_date', date.monthStartDate).lte('workout_date', date.monthEndDate),
      supabaseAdmin.from('meal_logs').select('logged_at').eq('user_id', userId).gte('logged_at', date.monthStartIso).lt('logged_at', date.nextMonthStartIso),
    ]);
    const queryErrors = [profileRes.error, todayMealsRes.error, todayWorkoutsRes.error, weekWorkoutsRes.error, monthWorkoutsRes.error, monthMealsRes.error].filter(Boolean);
    if (queryErrors.length > 0) {
      console.error('Dashboard query error:', queryErrors);
      res.status(400).json({ success: false, error: 'Bad Request', message: queryErrors[0]?.message ?? 'Failed to retrieve dashboard data' });
      return;
    }
    const profile = profileRes.data, todayMeals = todayMealsRes.data ?? [], todayWorkouts = todayWorkoutsRes.data ?? [], weekWorkouts = weekWorkoutsRes.data ?? [];
    if (!profile) { res.status(404).json({ success: false, error: 'Not Found', message: 'Profile not found' }); return; }
    const nutritionConsumed = todayMeals.reduce((acc, meal) => {
      acc.calories += Number(meal.total_calories ?? 0); acc.protein += Number(meal.total_protein ?? 0);
      acc.carbs += Number(meal.total_carbs ?? 0); acc.fat += Number(meal.total_fat ?? 0);
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    const nutrition = {
      calories: buildNutritionMetric(nutritionConsumed.calories, Number(profile.daily_calories ?? 2000)),
      protein: buildNutritionMetric(nutritionConsumed.protein, Number(profile.protein_grams ?? 150)),
      carbs: buildNutritionMetric(nutritionConsumed.carbs, Number(profile.carbs_grams ?? 200)),
      fat: buildNutritionMetric(nutritionConsumed.fat, Number(profile.fat_grams ?? 65)),
      meals_logged: todayMeals.length,
    };
    const todayRoutineIds = [...new Set(todayWorkouts.map((session) => session.routine_id).filter((routineId): routineId is string => Boolean(routineId)))];
    let routineExercises: Array<{ routine_id: string; exercise_id: string; target_sets: number | null; order_index: number }> = [];
    if (todayRoutineIds.length > 0) {
      const routineExercisesRes = await supabaseAdmin.from('routine_exercises').select('routine_id, exercise_id, target_sets, order_index').in('routine_id', todayRoutineIds).order('order_index', { ascending: true });
      if (routineExercisesRes.error) {
        console.error('Error fetching routine exercises:', routineExercisesRes.error);
        res.status(400).json({ success: false, error: 'Bad Request', message: routineExercisesRes.error.message });
        return;
      }
      routineExercises = routineExercisesRes.data ?? [];
    }
    const workoutCards = todayWorkouts.map((session) => {
      const completedSets = (session.workout_sets ?? []).filter((set) => set.is_completed !== false);
      const routineTargets = routineExercises.filter((item) => item.routine_id === session.routine_id);
      const completedSetsByExercise = completedSets.reduce<Record<string, number>>((acc, set) => { acc[set.exercise_id] = (acc[set.exercise_id] ?? 0) + 1; return acc; }, {});
      const exercisesCompleted = routineTargets.filter((target) => (completedSetsByExercise[target.exercise_id] ?? 0) >= Number(target.target_sets ?? 0)).length;
      const totalSets = routineTargets.reduce((sum, target) => sum + Number(target.target_sets ?? 0), 0);
      const routine = Array.isArray(session.workout_routines) ? session.workout_routines[0] : session.workout_routines;
      const status = totalSets > 0 && completedSets.length >= totalSets ? 'completed' : completedSets.length > 0 ? 'in_progress' : 'started';
      return {
        session_id: session.id, routine_id: session.routine_id, routine_name: routine?.name ?? 'Workout',
        routine_description: routine?.description ?? null, cover_image_url: routine?.cover_image_url ?? null,
        status, exercises_completed: exercisesCompleted, total_exercises: routineTargets.length,
        sets_completed: completedSets.length, total_sets: totalSets, total_volume_kg: round2(Number(session.total_volume_kg ?? 0)), started_at: session.created_at,
      };
    });
    const primaryWorkout = workoutCards[0] ?? null, weekSessionIds = weekWorkouts.map((session) => session.id);
    let weekSets: Array<{ session_id: string; is_completed: boolean | null }> = [];
    if (weekSessionIds.length > 0) {
      const weekSetsRes = await supabaseAdmin.from('workout_sets').select('session_id, is_completed').in('session_id', weekSessionIds);
      if (weekSetsRes.error) {
        console.error('Error fetching weekly workout sets:', weekSetsRes.error);
        res.status(400).json({ success: false, error: 'Bad Request', message: weekSetsRes.error.message });
        return;
      }
      weekSets = weekSetsRes.data ?? [];
    }
    const weekDays = Array.from({ length: 7 }, (_, index) => {
      const start = new Date(`${date.weekStartDate}T00:00:00.000Z`);
      start.setUTCDate(start.getUTCDate() + index);
      const dateString = start.toISOString().slice(0, 10);
      const sessionsForDay = weekWorkouts.filter((session) => session.workout_date === dateString);
      const sessionIdsForDay = new Set(sessionsForDay.map((session) => session.id));
      const setsCompleted = weekSets.filter((set) => sessionIdsForDay.has(set.session_id) && set.is_completed !== false).length;
      return {
        date: dateString, day: start.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
        workouts: sessionsForDay.length, sets_completed: setsCompleted,
        total_volume_kg: round2(sessionsForDay.reduce((sum, session) => sum + Number(session.total_volume_kg ?? 0), 0)),
      };
    });
    const workoutDates = [...new Set((monthWorkoutsRes.data ?? []).map((item) => item.workout_date))].sort();
    const mealLogDates = [...new Set((monthMealsRes.data ?? []).map((item) => new Date(new Date(item.logged_at).getTime() + offsetMinutes * 60_000).toISOString().slice(0, 10)))].sort();
    let coachCheckin: { type: 'nutrition' | 'workout' | 'success' | 'general'; title: string; message: string; suggestion: string; action: { label: string; route: string } };
    if (nutrition.protein.exceeded > 0) {
      coachCheckin = { type: 'success', title: 'Protein goal reached!', message: `You are ${nutrition.protein.exceeded}g above your protein target today.`, suggestion: 'Keep the rest of your meals balanced and stay within your overall calorie target.', action: { label: 'Ask Rocco', route: '/coach' } };
    } else if (nutrition.protein.remaining >= 25) {
      coachCheckin = { type: 'nutrition', title: 'Protein check', message: `You are ${nutrition.protein.remaining}g away from your protein target today.`, suggestion: 'Prioritize a protein-rich option in your next meal.', action: { label: 'Ask Rocco', route: '/coach' } };
    } else if (nutrition.calories.exceeded > 0) {
      coachCheckin = { type: 'nutrition', title: 'Calories are a little high today', message: `You are ${nutrition.calories.exceeded} calories above your daily target.`, suggestion: 'No need to compensate aggressively. Return to your normal target at your next meal or tomorrow.', action: { label: 'Ask Rocco', route: '/coach' } };
    } else if (primaryWorkout?.status === 'in_progress') {
      coachCheckin = { type: 'workout', title: 'Workout in progress', message: `You have completed ${primaryWorkout.exercises_completed} of ${primaryWorkout.total_exercises} exercises.`, suggestion: 'Finish the remaining exercises with good form and controlled reps.', action: { label: 'Continue Workout', route: '/workouts' } };
    } else if (primaryWorkout?.status === 'completed') {
      coachCheckin = { type: 'success', title: 'Workout complete!', message: `You finished ${primaryWorkout.routine_name} today.`, suggestion: 'Focus on recovery, hydration, and hitting the rest of your nutrition targets.', action: { label: 'Ask Rocco', route: '/coach' } };
    } else {
      coachCheckin = { type: 'general', title: 'Stay consistent today', message: `You have ${nutrition.calories.remaining} calories and ${nutrition.protein.remaining}g protein remaining.`, suggestion: 'Keep logging your meals and complete your planned training when you are ready.', action: { label: 'Ask Rocco', route: '/coach' } };
    }
    res.status(200).json({
      success: true, message: 'Dashboard data retrieved successfully.',
      data: {
        user: { full_name: profile.full_name, avatar_url: profile.avatar_url, primary_goal: profile.primary_goal, streak_count: profile.streak_count ?? 0, workout_days_per_week: profile.workout_days_per_week ?? 0, is_onboarded: profile.is_onboarded },
        today: {
          date: date.todayDate, nutrition,
          meals: todayMeals.map((meal) => ({ id: meal.id, meal_type: meal.meal_type, raw_input_prompt: meal.raw_input_prompt, calories: Number(meal.total_calories ?? 0), protein: round1(Number(meal.total_protein ?? 0)), carbs: round1(Number(meal.total_carbs ?? 0)), fat: round1(Number(meal.total_fat ?? 0)), food_items: meal.food_items ?? [], logged_at: meal.logged_at })),
          workout: primaryWorkout, workout_sessions: workoutCards,
        },
        week: { start_date: date.weekStartDate, end_date: date.weekEndDate, workouts: { completed: weekWorkouts.length, target: profile.workout_days_per_week ?? 0 }, activity: weekDays },
        calendar: { year: date.year, month: date.month, workout_dates: workoutDates, meal_log_dates: mealLogDates },
        coach_checkin: coachCheckin,
      },
    });
  } catch (err) {
    console.error('Dashboard Summary Error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: err instanceof Error ? err.message : 'Failed to retrieve dashboard summary' });
  }
};