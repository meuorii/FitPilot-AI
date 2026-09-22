import type { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import {
  aiServiceClient,
  type UserContext,
  type CoachChatMessage,
} from '../services/ai-service.client.js';

type NutritionMetric = {
  consumed: number;
  target: number;
  remaining: number;
  percentage: number;
};

type CoachWorkoutStatus =
  | 'no_split'
  | 'not_scheduled'
  | 'rest_day'
  | 'not_started'
  | 'in_progress'
  | 'completed';

interface MealTotalsRow {
  total_calories: number | string | null;
  total_protein: number | string | null;
  total_carbs: number | string | null;
  total_fat: number | string | null;
}

interface WorkoutRoutineRelation {
  id?: string;
  name?: string | null;
  description?: string | null;
}

interface WorkoutSessionRow {
  status: string | null;
  total_volume_kg: number | string | null;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  workout_routines:
    | WorkoutRoutineRelation
    | WorkoutRoutineRelation[]
    | null;
}

interface ActiveSplitRow {
  id: string;
  name: string;
  description: string | null;
}

interface TodaySplitDayRow {
  id: string;
  day_of_week: number;
  routine_id: string | null;
  is_rest_day: boolean;
  order_index: number;
  workout_routines:
    | WorkoutRoutineRelation
    | WorkoutRoutineRelation[]
    | null;
}

interface CoachSessionItem {
  routine_name: string;
  status: string;
  total_volume_kg: number;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
}

interface CoachContextResponse {
  user: {
    full_name: string;
    fitness_experience: string | null;
  };
  goals: {
    primary_goal: string;
    primary_goal_label: string;
    current_weight_kg: number | null;
    target_weight_kg: number | null;
  };
  nutrition: {
    calories: NutritionMetric;
    protein: NutritionMetric;
    carbs: NutritionMetric;
    fat: NutritionMetric;
  };
  workout: {
    split: {
      id: string;
      name: string;
      description: string | null;
    } | null;
    today: {
      day_of_week: number;
      day_label: string;
      scheduled: boolean;
      split_day_id: string | null;
      routine_id: string | null;
      routine_name: string | null;
      is_rest_day: boolean;
    };
    status: CoachWorkoutStatus;
    label: string;
    sessions: Array<{
      routine_name: string;
      status: string;
      total_volume_kg: number;
      notes: string | null;
      started_at: string | null;
      completed_at: string | null;
    }>;
  };
}

const numberOrZero = (value: unknown): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const numberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatGoalLabel = (goal: unknown): string => {
  const value = String(goal ?? '').trim();

  if (!value) return 'Maintain';

  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const DAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

const getDayLabel = (dayOfWeek: number): string =>
  DAY_LABELS[dayOfWeek] ?? 'Unknown';

const getRelatedRoutine = (
  relation:
    | WorkoutRoutineRelation
    | WorkoutRoutineRelation[]
    | null
    | undefined,
): WorkoutRoutineRelation | null => {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
};

const buildNutritionMetric = (
  consumedValue: unknown,
  targetValue: unknown,
): NutritionMetric => {
  const consumed = numberOrZero(consumedValue);
  const target = numberOrZero(targetValue);
  const remaining = Math.max(target - consumed, 0);
  const percentage =
    target > 0 ? Math.max(0, Math.round((consumed / target) * 100)) : 0;

  return {
    consumed,
    target,
    remaining,
    percentage,
  };
};

const DEFAULT_TIMEZONE_OFFSET_MINUTES = 480; // UTC+8 / Philippines

const getTimezoneOffsetMinutes = (req: Request): number => {
  const raw = req.header('x-timezone-offset-minutes');

  // Browser requests send this header through the client API.
  // Postman/manual requests may omit it, so FitPilot falls back to UTC+8
  // instead of UTC to avoid resolving the previous calendar day.
  if (raw === undefined || raw === null || raw.trim() === '') {
    return DEFAULT_TIMEZONE_OFFSET_MINUTES;
  }

  const parsed = Number(raw);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_TIMEZONE_OFFSET_MINUTES;
  }

  // Valid real-world UTC offsets fall within -12:00 through +14:00.
  return Math.max(-720, Math.min(840, parsed));
};

const getClientDayBounds = (req: Request) => {
  const offsetMinutes = getTimezoneOffsetMinutes(req);
  const shiftedNow = new Date(Date.now() + offsetMinutes * 60_000);

  const year = shiftedNow.getUTCFullYear();
  const month = shiftedNow.getUTCMonth();
  const day = shiftedNow.getUTCDate();

  const localMidnightAsUtc = Date.UTC(year, month, day);
  const startUtcMs = localMidnightAsUtc - offsetMinutes * 60_000;
  const endUtcMs = startUtcMs + 24 * 60 * 60 * 1000 - 1;

  const todayDate = [
    String(year).padStart(4, '0'),
    String(month + 1).padStart(2, '0'),
    String(day).padStart(2, '0'),
  ].join('-');

  return {
    startOfDayIso: new Date(startUtcMs).toISOString(),
    endOfDayIso: new Date(endUtcMs).toISOString(),
    todayDate,
    dayOfWeek: shiftedNow.getUTCDay(),
  };
};

const loadCoachData = async (
  req: Request,
  userId: string,
): Promise<{
  aiContext: UserContext;
  uiContext: CoachContextResponse;
} | null> => {
  const {
    startOfDayIso,
    endOfDayIso,
    todayDate,
    dayOfWeek,
  } = getClientDayBounds(req);

  const [profileRes, mealsRes, workoutsRes, activeSplitRes] =
    await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select(
        'full_name, primary_goal, fitness_experience, current_weight_kg, target_weight_kg, daily_calories, protein_grams, carbs_grams, fat_grams',
      )
      .eq('id', userId)
      .single(),

    supabaseAdmin
      .from('meal_logs')
      .select(
        'total_calories, total_protein, total_carbs, total_fat',
      )
      .eq('user_id', userId)
      .gte('logged_at', startOfDayIso)
      .lte('logged_at', endOfDayIso),

    supabaseAdmin
      .from('workout_sessions')
      .select(
        'status, total_volume_kg, notes, started_at, completed_at, workout_routines(name)',
      )
      .eq('user_id', userId)
      .eq('workout_date', todayDate)
      .order('started_at', { ascending: true }),

    supabaseAdmin
      .from('workout_splits')
      .select('id, name, description')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (profileRes.error || !profileRes.data) {
    return null;
  }

  if (mealsRes.error) {
    throw mealsRes.error;
  }

  if (workoutsRes.error) {
    throw workoutsRes.error;
  }

  if (activeSplitRes.error) {
    throw activeSplitRes.error;
  }

  const profile = profileRes.data;
  const meals = (mealsRes.data ?? []) as MealTotalsRow[];
  const workouts = (workoutsRes.data ?? []) as WorkoutSessionRow[];
  const activeSplit =
    (activeSplitRes.data ?? null) as ActiveSplitRow | null;

  let todaySplitDay: TodaySplitDayRow | null = null;

  if (activeSplit) {
    const splitDayRes = await supabaseAdmin
      .from('workout_split_days')
      .select(
        'id, day_of_week, routine_id, is_rest_day, order_index, workout_routines(id, name, description)',
      )
      .eq('split_id', activeSplit.id)
      .eq('day_of_week', dayOfWeek)
      .maybeSingle();

    if (splitDayRes.error) {
      throw splitDayRes.error;
    }

    todaySplitDay =
      (splitDayRes.data ?? null) as TodaySplitDayRow | null;
  }

  const consumedCalories = meals.reduce(
    (sum, meal) => sum + numberOrZero(meal.total_calories),
    0,
  );
  const consumedProtein = meals.reduce(
    (sum, meal) => sum + numberOrZero(meal.total_protein),
    0,
  );
  const consumedCarbs = meals.reduce(
    (sum, meal) => sum + numberOrZero(meal.total_carbs),
    0,
  );
  const consumedFat = meals.reduce(
    (sum, meal) => sum + numberOrZero(meal.total_fat),
    0,
  );

  const sessionItems: CoachSessionItem[] = workouts.map(
    (workout) => {
      const routine = getRelatedRoutine(
        workout.workout_routines,
      );

      return {
        routine_name:
          routine?.name || 'Custom Workout',
        status: String(workout.status || 'completed'),
        total_volume_kg: numberOrZero(
          workout.total_volume_kg,
        ),
        notes: workout.notes || null,
        started_at: workout.started_at || null,
        completed_at: workout.completed_at || null,
      };
    },
  );

  const todayRoutine = getRelatedRoutine(
    todaySplitDay?.workout_routines,
  );

  const todayRoutineName =
    typeof todayRoutine?.name === 'string'
      ? todayRoutine.name
      : null;

  const isTodayRestDay = Boolean(
    todaySplitDay?.is_rest_day,
  );

  const hasInProgressSession = sessionItems.some(
    (workout) => workout.status === 'in_progress',
  );
  const hasCompletedSession = sessionItems.some(
    (workout) => workout.status === 'completed',
  );

  let workoutStatus: CoachWorkoutStatus;
  let workoutLabel: string;

  if (hasInProgressSession) {
    workoutStatus = 'in_progress';
    workoutLabel = todayRoutineName
      ? `${todayRoutineName} • In progress`
      : 'Workout in progress';
  } else if (hasCompletedSession) {
    workoutStatus = 'completed';
    workoutLabel = todayRoutineName
      ? `${todayRoutineName} • Completed`
      : 'Workout completed';
  } else if (!activeSplit) {
    workoutStatus = 'no_split';
    workoutLabel = 'No active workout split';
  } else if (!todaySplitDay) {
    workoutStatus = 'not_scheduled';
    workoutLabel = 'No workout scheduled today';
  } else if (isTodayRestDay) {
    workoutStatus = 'rest_day';
    workoutLabel = 'Rest day';
  } else {
    workoutStatus = 'not_started';
    workoutLabel = todayRoutineName
      ? `${todayRoutineName} • Not started`
      : 'Workout not started';
  }

  const scheduleContextNote = activeSplit
    ? isTodayRestDay
      ? `Active split: ${activeSplit.name}. Today (${getDayLabel(
          dayOfWeek,
        )}) is a scheduled rest day.`
      : todayRoutineName
        ? `Active split: ${activeSplit.name}. Today's scheduled routine is ${todayRoutineName}. Current status: ${workoutLabel}.`
        : `Active split: ${activeSplit.name}. No routine is scheduled for ${getDayLabel(
            dayOfWeek,
          )}.`
    : 'No active workout split is currently selected.';

  const calories = buildNutritionMetric(
    consumedCalories,
    profile.daily_calories,
  );
  const protein = buildNutritionMetric(
    consumedProtein,
    profile.protein_grams,
  );
  const carbs = buildNutritionMetric(
    consumedCarbs,
    profile.carbs_grams,
  );
  const fat = buildNutritionMetric(
    consumedFat,
    profile.fat_grams,
  );

  const aiContext: UserContext = {
    fullName: profile.full_name,
    fitnessGoal: profile.primary_goal,
    fitnessExperience: profile.fitness_experience,
    currentWeightKg:
      numberOrNull(profile.current_weight_kg) ?? undefined,
    targetWeightKg:
      numberOrNull(profile.target_weight_kg) ?? undefined,
    dailyCalorieGoal: numberOrZero(profile.daily_calories),
    dailyProteinGoal: numberOrZero(profile.protein_grams),
    dailyCarbsGoal: numberOrZero(profile.carbs_grams),
    dailyFatGoal: numberOrZero(profile.fat_grams),
    consumedCaloriesToday: calories.consumed,
    consumedProteinToday: protein.consumed,
    consumedCarbsToday: carbs.consumed,
    consumedFatToday: fat.consumed,
    todaysWorkouts:
      sessionItems.length > 0
        ? sessionItems.map((workout) => ({
            routine_name: workout.routine_name,
            total_volume_kg: workout.total_volume_kg,
            notes: [workout.notes, scheduleContextNote]
              .filter(Boolean)
              .join(' • '),
          }))
        : [
            {
              routine_name: isTodayRestDay
                ? 'Rest Day'
                : todayRoutineName ||
                  'No Scheduled Workout',
              total_volume_kg: 0,
              notes: scheduleContextNote,
            },
          ],
  };

  const uiContext: CoachContextResponse = {
    user: {
      full_name: profile.full_name,
      fitness_experience:
        profile.fitness_experience || null,
    },
    goals: {
      primary_goal: profile.primary_goal || 'maintain',
      primary_goal_label: formatGoalLabel(
        profile.primary_goal,
      ),
      current_weight_kg: numberOrNull(
        profile.current_weight_kg,
      ),
      target_weight_kg: numberOrNull(
        profile.target_weight_kg,
      ),
    },
    nutrition: {
      calories,
      protein,
      carbs,
      fat,
    },
    workout: {
      split: activeSplit
        ? {
            id: String(activeSplit.id),
            name: String(activeSplit.name),
            description: activeSplit.description || null,
          }
        : null,
      today: {
        day_of_week: dayOfWeek,
        day_label: getDayLabel(dayOfWeek),
        scheduled: Boolean(todaySplitDay),
        split_day_id: todaySplitDay?.id
          ? String(todaySplitDay.id)
          : null,
        routine_id:
          !isTodayRestDay && todaySplitDay?.routine_id
            ? String(todaySplitDay.routine_id)
            : null,
        routine_name: isTodayRestDay
          ? null
          : todayRoutineName,
        is_rest_day: isTodayRestDay,
      },
      status: workoutStatus,
      label: workoutLabel,
      sessions: sessionItems,
    },
  };

  return {
    aiContext,
    uiContext,
  };
};

export const getCoachContext = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized.',
      });
    }

    const coachData = await loadCoachData(req, userId);

    if (!coachData) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: coachData.uiContext,
    });
  } catch (error: any) {
    console.error(
      '🔥 [Coach Context Error]:',
      error?.message || error,
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        'Failed to load AI Coach context.',
    });
  }
};

export const handleCoachChat = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = (req as any).user?.id;
    const { message, history } = req.body as {
      message: string;
      history?: CoachChatMessage[];
    };

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized.',
      });
    }

    if (!message?.trim()) {
      return res.status(400).json({
        error: 'Message is required.',
      });
    }

    const coachData = await loadCoachData(req, userId);

    if (!coachData) {
      return res.status(404).json({
        error: 'User profile not found.',
      });
    }

    const aiResponse =
      await aiServiceClient.coachChat({
        message: message.trim(),
        history: history || [],
        context: coachData.aiContext,
      });

    return res.status(200).json({
      reply: aiResponse.reply,
    });
  } catch (error: any) {
    console.error(
      '🔥 [Coach Controller Error]:',
      error?.message || error,
    );

    return res.status(500).json({
      error:
        error?.message ||
        'Failed to process AI Coach chat request.',
    });
  }
};