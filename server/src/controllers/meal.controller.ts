import type { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { aiServiceClient } from '../services/ai-service.client.js';

const DEFAULT_TIMEZONE_OFFSET_MINUTES = 480;
const MIN_TIMEZONE_OFFSET_MINUTES = -720;
const MAX_TIMEZONE_OFFSET_MINUTES = 840;

interface MealTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealLogRow {
  id?: string;
  meal_type?: string | null;
  raw_input_prompt?: string | null;
  total_calories: number | string | null;
  total_protein: number | string | null;
  total_carbs: number | string | null;
  total_fat: number | string | null;
  food_items?: unknown;
  logged_at?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
}

interface ProfileTargets {
  daily_calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
}

const getTimezoneOffsetMinutes = (req: Request): number => {
  const rawOffset = req.header('x-timezone-offset-minutes');

  if (!rawOffset?.trim()) return DEFAULT_TIMEZONE_OFFSET_MINUTES;

  const parsedOffset = Number(rawOffset);
  if (!Number.isFinite(parsedOffset)) return DEFAULT_TIMEZONE_OFFSET_MINUTES;

  return Math.max(
    MIN_TIMEZONE_OFFSET_MINUTES,
    Math.min(MAX_TIMEZONE_OFFSET_MINUTES, parsedOffset),
  );
};

const getClientLocalDate = (req: Request): string => {
  const offsetMinutes = getTimezoneOffsetMinutes(req);
  const shiftedNow = new Date(Date.now() + offsetMinutes * 60_000);

  return shiftedNow.toISOString().slice(0, 10);
};

const isValidDateString = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`));

const getDayBoundsForDate = (
  dateString: string,
  offsetMinutes: number,
): { startOfDayIso: string; endOfDayIso: string } => {
  // Use fixed string slices instead of split('-')[index].
  // This avoids TypeScript's possibly-undefined error when
  // noUncheckedIndexedAccess is enabled.
  const year = Number(dateString.slice(0, 4));
  const month = Number(dateString.slice(5, 7));
  const day = Number(dateString.slice(8, 10));

  const localMidnightAsUtcMs = Date.UTC(year, month - 1, day);
  const startOfDayUtcMs =
    localMidnightAsUtcMs - offsetMinutes * 60_000;

  return {
    startOfDayIso: new Date(startOfDayUtcMs).toISOString(),
    endOfDayIso: new Date(
      startOfDayUtcMs + 24 * 60 * 60 * 1000 - 1,
    ).toISOString(),
  };
};

const getWeekStartDate = (dateString: string): string => {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  const day = date.getUTCDay(); // 0 Sunday, 1 Monday
  const daysFromMonday = day === 0 ? 6 : day - 1;

  date.setUTCDate(date.getUTCDate() - daysFromMonday);
  return date.toISOString().slice(0, 10);
};

const addDays = (dateString: string, days: number): string => {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const getProfileTargets = async (
  userId: string,
): Promise<ProfileTargets> => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('daily_calories, protein_grams, carbs_grams, fat_grams')
    .eq('id', userId)
    .single();

  if (error) throw error;

  return {
    daily_calories: Number(data?.daily_calories ?? 2000),
    protein_grams: Number(data?.protein_grams ?? 150),
    carbs_grams: Number(data?.carbs_grams ?? 200),
    fat_grams: Number(data?.fat_grams ?? 65),
  };
};

const calculateTotals = (meals: MealLogRow[]): MealTotals =>
  meals.reduce<MealTotals>(
    (totals, meal) => {
      totals.calories += Number(meal.total_calories ?? 0);
      totals.protein += Number(meal.total_protein ?? 0);
      totals.carbs += Number(meal.total_carbs ?? 0);
      totals.fat += Number(meal.total_fat ?? 0);
      return totals;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

const round1 = (value: number): number =>
  Number(value.toFixed(1));

const serializeTotals = (totals: MealTotals) => ({
  calories: Math.round(totals.calories),
  protein: round1(totals.protein),
  carbs: round1(totals.carbs),
  fat: round1(totals.fat),
});

const serializeMeal = (meal: MealLogRow) => ({
  id: meal.id,
  meal_type: meal.meal_type,
  raw_input_prompt: meal.raw_input_prompt,
  calories: Number(meal.total_calories ?? 0),
  protein: round1(Number(meal.total_protein ?? 0)),
  carbs: round1(Number(meal.total_carbs ?? 0)),
  fat: round1(Number(meal.total_fat ?? 0)),
  food_items: meal.food_items ?? [],
  logged_at: meal.logged_at,
  created_at: meal.created_at,
});

const getMealsForRange = async (
  userId: string,
  startOfDayIso: string,
  endOfDayIso: string,
): Promise<MealLogRow[]> => {
  const { data, error } = await supabaseAdmin
    .from('meal_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', startOfDayIso)
    .lte('logged_at', endOfDayIso)
    .order('logged_at', { ascending: false });

  if (error) throw error;

  return (data ?? []) as MealLogRow[];
};

export const parseMealText = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { text } = req.body ?? {};

    if (typeof text !== 'string' || !text.trim()) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Please provide a non-empty text prompt to parse meal.',
      });
      return;
    }

    const aiParsedResult = await aiServiceClient.parseMeal(text.trim());

    res.status(200).json({
      success: true,
      message: 'Meal parsed successfully',
      data: aiParsedResult,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message:
        err instanceof Error
          ? err.message
          : 'Failed to parse meal with AI service',
    });
  }
};

export const logMeal = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User ID missing',
      });
      return;
    }

    const requestBody =
      req.body && typeof req.body === 'object' ? req.body : {};

    const nestedData =
      requestBody.data && typeof requestBody.data === 'object'
        ? requestBody.data
        : null;

    const payload = nestedData ?? requestBody;

    const {
      foods,
      totalCalories,
      total_calories,
      protein,
      total_protein,
      carbs,
      total_carbs,
      fat,
      total_fat,
    } = payload;

    const mealType =
      requestBody.meal_type || payload.meal_type || 'snack';

    const rawInputPrompt =
      requestBody.raw_input_prompt ||
      requestBody.raw_text ||
      payload.raw_input_prompt ||
      payload.raw_text ||
      '';

    const foodItems =
      foods || payload.food_items || payload.foods;

    if (!Array.isArray(foodItems) || foodItems.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'At least one food item is required to log a meal.',
      });
      return;
    }

    const finalCalories = Math.round(
      Number(total_calories ?? totalCalories ?? 0) || 0,
    );

    const finalProtein =
      Number(total_protein ?? protein ?? 0) || 0;
    const finalCarbs =
      Number(total_carbs ?? carbs ?? 0) || 0;
    const finalFat =
      Number(total_fat ?? fat ?? 0) || 0;

    const { data: newMealLog, error } = await supabaseAdmin
      .from('meal_logs')
      .insert([
        {
          user_id: userId,
          meal_type: mealType,
          raw_input_prompt: rawInputPrompt,
          food_items: foodItems,
          total_calories: finalCalories,
          total_protein: finalProtein,
          total_carbs: finalCarbs,
          total_fat: finalFat,
          logged_at: new Date().toISOString(),
        },
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Supabase Meal Log Error:', error);
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: error.message,
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Meal logged successfully!',
      data: newMealLog,
    });
  } catch (err) {
    console.error('Log Meal Internal Error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err instanceof Error ? err.message : 'Failed to log meal',
    });
  }
};

export const getMealsByDate = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User ID missing',
      });
      return;
    }

    const requestedDate = String(req.params.date ?? '').trim();

    if (!isValidDateString(requestedDate)) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Date must use YYYY-MM-DD format.',
      });
      return;
    }

    const offsetMinutes = getTimezoneOffsetMinutes(req);
    const bounds = getDayBoundsForDate(requestedDate, offsetMinutes);
    const [meals, targets] = await Promise.all([
      getMealsForRange(
        userId,
        bounds.startOfDayIso,
        bounds.endOfDayIso,
      ),
      getProfileTargets(userId),
    ]);

    const totals = calculateTotals(meals);

    res.status(200).json({
      success: true,
      data: {
        date: requestedDate,
        meals: meals.map(serializeMeal),
        summary: serializeTotals(totals),
        targets,
        remaining: {
          calories: Math.max(0, targets.daily_calories - totals.calories),
          protein: round1(Math.max(0, targets.protein_grams - totals.protein)),
          carbs: round1(Math.max(0, targets.carbs_grams - totals.carbs)),
          fat: round1(Math.max(0, targets.fat_grams - totals.fat)),
        },
      },
    });
  } catch (err) {
    console.error('Get Meals By Date Error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err instanceof Error ? err.message : 'Failed to fetch meals',
    });
  }
};

export const getTodayMeals = async (
  req: Request,
  res: Response,
): Promise<void> => {
  req.params.date = getClientLocalDate(req);
  await getMealsByDate(req, res);
};

export const getYesterdayMeals = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const today = getClientLocalDate(req);
  req.params.date = addDays(today, -1);
  await getMealsByDate(req, res);
};

export const getMealHistory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User ID missing',
      });
      return;
    }

    const offsetMinutes = getTimezoneOffsetMinutes(req);
    const endDate = getClientLocalDate(req);
    const rawDays = Number(req.query.days ?? 30);
    const days = Number.isFinite(rawDays)
      ? Math.min(365, Math.max(1, Math.floor(rawDays)))
      : 30;

    const startDate = addDays(endDate, -(days - 1));
    const startBounds = getDayBoundsForDate(startDate, offsetMinutes);
    const endBounds = getDayBoundsForDate(endDate, offsetMinutes);

    const [meals, targets] = await Promise.all([
      getMealsForRange(
        userId,
        startBounds.startOfDayIso,
        endBounds.endOfDayIso,
      ),
      getProfileTargets(userId),
    ]);

    const byDate = new Map<string, MealLogRow[]>();

    for (const meal of meals) {
      if (!meal.logged_at) continue;

      const localDate = new Date(
        new Date(meal.logged_at).getTime() +
          offsetMinutes * 60_000,
      )
        .toISOString()
        .slice(0, 10);

      if (!byDate.has(localDate)) byDate.set(localDate, []);
      byDate.get(localDate)!.push(meal);
    }

    const daily = Array.from({ length: days }, (_, index) => {
      const date = addDays(startDate, index);
      const dateMeals = byDate.get(date) ?? [];
      const totals = calculateTotals(dateMeals);

      return {
        date,
        meals_logged: dateMeals.length,
        ...serializeTotals(totals),
      };
    });

    const periodTotals = daily.reduce<MealTotals>(
      (totals, day) => {
        totals.calories += day.calories;
        totals.protein += day.protein;
        totals.carbs += day.carbs;
        totals.fat += day.fat;
        return totals;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    const loggedDays = daily.filter((day) => day.meals_logged > 0).length;

    res.status(200).json({
      success: true,
      data: {
        start_date: startDate,
        end_date: endDate,
        days,
        daily,
        period_summary: {
          ...serializeTotals(periodTotals),
          average_daily_calories: Math.round(periodTotals.calories / days),
          average_daily_protein: round1(periodTotals.protein / days),
          average_daily_carbs: round1(periodTotals.carbs / days),
          average_daily_fat: round1(periodTotals.fat / days),
          logged_days: loggedDays,
        },
        targets,
      },
    });
  } catch (err) {
    console.error('Get Meal History Error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message:
        err instanceof Error ? err.message : 'Failed to fetch meal history',
    });
  }
};

export const getWeeklyMeals = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User ID missing',
      });
      return;
    }

    const offsetMinutes = getTimezoneOffsetMinutes(req);
    const requestedDate =
      typeof req.query.date === 'string' && isValidDateString(req.query.date)
        ? req.query.date
        : getClientLocalDate(req);

    if (!isValidDateString(requestedDate)) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Date must use YYYY-MM-DD format.',
      });
      return;
    }

    const weekStart = getWeekStartDate(requestedDate);
    const weekEnd = addDays(weekStart, 6);

    const startBounds = getDayBoundsForDate(weekStart, offsetMinutes);
    const endBounds = getDayBoundsForDate(weekEnd, offsetMinutes);

    const [meals, targets] = await Promise.all([
      getMealsForRange(
        userId,
        startBounds.startOfDayIso,
        endBounds.endOfDayIso,
      ),
      getProfileTargets(userId),
    ]);

    const byDate = new Map<string, MealLogRow[]>();

    for (const meal of meals) {
      if (!meal.logged_at) continue;

      const localDate = new Date(
        new Date(meal.logged_at).getTime() +
          offsetMinutes * 60_000,
      )
        .toISOString()
        .slice(0, 10);

      if (!byDate.has(localDate)) byDate.set(localDate, []);
      byDate.get(localDate)!.push(meal);
    }

    const daily = Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      const dateMeals = byDate.get(date) ?? [];
      const totals = calculateTotals(dateMeals);

      return {
        date,
        meals_logged: dateMeals.length,
        ...serializeTotals(totals),
      };
    });

    const weeklyTotals = daily.reduce<MealTotals>(
      (totals, day) => {
        totals.calories += day.calories;
        totals.protein += day.protein;
        totals.carbs += day.carbs;
        totals.fat += day.fat;
        return totals;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    res.status(200).json({
      success: true,
      data: {
        week_start: weekStart,
        week_end: weekEnd,
        daily,
        weekly_summary: {
          ...serializeTotals(weeklyTotals),
          average_daily_calories: Math.round(weeklyTotals.calories / 7),
          average_daily_protein: round1(weeklyTotals.protein / 7),
          average_daily_carbs: round1(weeklyTotals.carbs / 7),
          average_daily_fat: round1(weeklyTotals.fat / 7),
          logged_days: daily.filter((day) => day.meals_logged > 0).length,
        },
        daily_targets: targets,
        weekly_targets: {
          calories: targets.daily_calories * 7,
          protein: round1(targets.protein_grams * 7),
          carbs: round1(targets.carbs_grams * 7),
          fat: round1(targets.fat_grams * 7),
        },
        meals: meals.map(serializeMeal),
      },
    });
  } catch (err) {
    console.error('Get Weekly Meals Error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message:
        err instanceof Error ? err.message : 'Failed to fetch weekly meals',
    });
  }
};

export const deleteMealLog = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User ID missing',
      });
      return;
    }

    const mealId = Array.isArray(req.params.mealId)
      ? req.params.mealId[0]?.trim()
      : req.params.mealId?.trim();

    if (!mealId) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Meal ID is required.',
      });
      return;
    }

    const { error } = await supabaseAdmin
      .from('meal_logs')
      .delete()
      .eq('id', mealId)
      .eq('user_id', userId);

    if (error) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: error.message,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Meal log deleted successfully',
    });
  } catch (err) {
    console.error('Delete Meal Log Error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message:
        err instanceof Error ? err.message : 'Failed to delete meal log',
    });
  }
};
