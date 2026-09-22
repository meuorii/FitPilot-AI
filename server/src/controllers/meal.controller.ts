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
  total_calories: number | string | null;
  total_protein: number | string | null;
  total_carbs: number | string | null;
  total_fat: number | string | null;
  [key: string]: unknown;
}

const getTimezoneOffsetMinutes = (req: Request): number => {
  const rawOffset = req.header('x-timezone-offset-minutes');

  if (
    rawOffset === undefined ||
    rawOffset === null ||
    rawOffset.trim() === ''
  ) {
    return DEFAULT_TIMEZONE_OFFSET_MINUTES;
  }

  const parsedOffset = Number(rawOffset);

  if (!Number.isFinite(parsedOffset)) {
    return DEFAULT_TIMEZONE_OFFSET_MINUTES;
  }

  return Math.max(
    MIN_TIMEZONE_OFFSET_MINUTES,
    Math.min(MAX_TIMEZONE_OFFSET_MINUTES, parsedOffset),
  );
};

const getClientDayBounds = (
  req: Request,
): {
  startOfDayIso: string;
  endOfDayIso: string;
} => {
  const offsetMinutes = getTimezoneOffsetMinutes(req);

  /*
   * Shift "now" into the client's wall-clock time while still using UTC
   * getters. This lets us determine the client's current calendar date
   * without depending on the Render server's timezone.
   */
  const shiftedNow = new Date(
    Date.now() + offsetMinutes * 60_000,
  );

  const year = shiftedNow.getUTCFullYear();
  const month = shiftedNow.getUTCMonth();
  const day = shiftedNow.getUTCDate();

  /*
   * Date.UTC(year, month, day) represents the client's local midnight as
   * though it were UTC. Subtracting the client's offset converts that local
   * midnight into the real UTC instant stored by Supabase.
   *
   * Example for UTC+8:
   * 2026-09-22 00:00 +08 -> 2026-09-21T16:00:00.000Z
   */
  const localMidnightAsUtcMs = Date.UTC(
    year,
    month,
    day,
  );

  const startOfDayUtcMs =
    localMidnightAsUtcMs -
    offsetMinutes * 60_000;

  const endOfDayUtcMs =
    startOfDayUtcMs +
    24 * 60 * 60 * 1000 -
    1;

  return {
    startOfDayIso:
      new Date(startOfDayUtcMs).toISOString(),
    endOfDayIso:
      new Date(endOfDayUtcMs).toISOString(),
  };
};

const normalizeRouteParam = (
  value: string | string[] | undefined,
): string | null => {
  if (Array.isArray(value)) {
    return value[0]?.trim() || null;
  }

  return typeof value === 'string' && value.trim()
    ? value.trim()
    : null;
};

export const parseMealText = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { text } = req.body ?? {};

    if (
      typeof text !== 'string' ||
      !text.trim()
    ) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message:
          'Please provide a non-empty text prompt to parse meal.',
      });
      return;
    }

    const aiParsedResult =
      await aiServiceClient.parseMeal(
        text.trim(),
      );

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
      req.body &&
      typeof req.body === 'object'
        ? req.body
        : {};

    const nestedData =
      requestBody.data &&
      typeof requestBody.data === 'object'
        ? requestBody.data
        : null;

    const payload =
      nestedData ?? requestBody;

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
      requestBody.meal_type ||
      payload.meal_type ||
      'snack';

    const rawInputPrompt =
      requestBody.raw_input_prompt ||
      requestBody.raw_text ||
      payload.raw_input_prompt ||
      payload.raw_text ||
      '';

    const foodItems =
      foods ||
      payload.food_items ||
      payload.foods;

    if (
      !Array.isArray(foodItems) ||
      foodItems.length === 0
    ) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message:
          'At least one food item is required to log a meal.',
      });
      return;
    }

    const finalCalories = Math.round(
      Number(
        total_calories ??
          totalCalories ??
          0,
      ) || 0,
    );

    const finalProtein =
      Number(
        total_protein ??
          protein ??
          0,
      ) || 0;

    const finalCarbs =
      Number(
        total_carbs ??
          carbs ??
          0,
      ) || 0;

    const finalFat =
      Number(
        total_fat ??
          fat ??
          0,
      ) || 0;

    /*
     * Keep logged_at in UTC.
     * Supabase/Postgres timestamptz should store an absolute instant.
     * Local-day conversion belongs in read/query logic, not storage.
     */
    const loggedAt = new Date().toISOString();

    const {
      data: newMealLog,
      error,
    } = await supabaseAdmin
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
          logged_at: loggedAt,
        },
      ])
      .select('*')
      .single();

    if (error) {
      console.error(
        'Supabase Meal Log Error:',
        error,
      );

      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: error.message,
      });
      return;
    }

    res.status(201).json({
      success: true,
      message:
        'Meal logged successfully!',
      data: newMealLog,
    });
  } catch (err) {
    console.error(
      'Log Meal Internal Error:',
      err,
    );

    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message:
        err instanceof Error
          ? err.message
          : 'Failed to log meal',
    });
  }
};

export const getTodayMeals = async (
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

    const {
      startOfDayIso,
      endOfDayIso,
    } = getClientDayBounds(req);

    const {
      data: todayMeals,
      error,
    } = await supabaseAdmin
      .from('meal_logs')
      .select('*')
      .eq('user_id', userId)
      .gte(
        'logged_at',
        startOfDayIso,
      )
      .lte(
        'logged_at',
        endOfDayIso,
      )
      .order(
        'logged_at',
        {
          ascending: false,
        },
      );

    if (error) {
      throw error;
    }

    const meals =
      (todayMeals ?? []) as MealLogRow[];

    const totals = meals.reduce<MealTotals>(
      (accumulator, meal) => {
        accumulator.calories += Number(
          meal.total_calories ?? 0,
        );

        accumulator.protein += Number(
          meal.total_protein ?? 0,
        );

        accumulator.carbs += Number(
          meal.total_carbs ?? 0,
        );

        accumulator.fat += Number(
          meal.total_fat ?? 0,
        );

        return accumulator;
      },
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
    );

    res.status(200).json({
      success: true,
      data: {
        meals,
        today_summary: {
          total_calories:
            totals.calories,
          total_protein:
            Number(
              totals.protein.toFixed(1),
            ),
          total_carbs:
            Number(
              totals.carbs.toFixed(1),
            ),
          total_fat:
            Number(
              totals.fat.toFixed(1),
            ),
        },
      },
    });
  } catch (err) {
    console.error(
      'Get Today Meals Error:',
      err,
    );

    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message:
        err instanceof Error
          ? err.message
          : 'Failed to fetch today meals',
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

    const mealId = normalizeRouteParam(
      req.params.mealId,
    );

    if (!mealId) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Meal ID is required.',
      });
      return;
    }

    const { error } =
      await supabaseAdmin
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
      message:
        'Meal log deleted successfully',
    });
  } catch (err) {
    console.error(
      'Delete Meal Log Error:',
      err,
    );

    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message:
        err instanceof Error
          ? err.message
          : 'Failed to delete meal log',
    });
  }
};