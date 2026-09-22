import type { Request, Response } from 'express'
import { supabaseAdmin } from '../config/supabase.js'

const DEFAULT_TIMEZONE_OFFSET_MINUTES = 480
const MAX_LOG_LIMIT = 100
const DEFAULT_LOG_LIMIT = 25
const TREND_DAYS = 90

interface ProgressLogRow {
  id: string
  user_id: string
  weight_kg: number | string | null
  body_fat_percentage: number | string | null
  photo_url: string | null
  photo_tag: string | null
  logged_at: string
}

interface ProgressProfileRow {
  full_name: string
  primary_goal: string | null
  current_weight_kg: number | string | null
  target_weight_kg: number | string | null
  workout_days_per_week: number | null
}

interface WorkoutSessionRow {
  id: string
  workout_date: string
  total_volume_kg: number | string | null
  completed_at: string | null
}

interface ProgressGoalSummary {
  primary_goal: string
  current_weight_kg: number | null
  target_weight_kg: number | null
  starting_weight_kg: number | null
  weight_change_kg: number | null
  remaining_kg: number | null
  progress_percentage: number | null
}

const getUserId = (req: Request): string | null => {
  const userId = req.user?.id

  return typeof userId === 'string' && userId.trim()
    ? userId
    : null
}

const normalizeParam = (value: string | string[] | undefined): string | null => {
  if (Array.isArray(value)) {
    return value[0]?.trim() || null
  }

  return typeof value === 'string' && value.trim() ? value.trim() : null
}

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const toNumberOrZero = (value: unknown): number => {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

const round = (value: number, decimals = 2): number => {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

const getTimezoneOffsetMinutes = (req: Request): number => {
  const raw = req.header('x-timezone-offset-minutes')

  if (raw === undefined || raw === null || raw.trim() === '') {
    return DEFAULT_TIMEZONE_OFFSET_MINUTES
  }

  const parsed = Number(raw)

  if (!Number.isFinite(parsed)) {
    return DEFAULT_TIMEZONE_OFFSET_MINUTES
  }

  return clamp(parsed, -720, 840)
}

const formatDateOnly = (date: Date): string => {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const getClientDateContext = (req: Request) => {
  const offsetMinutes = getTimezoneOffsetMinutes(req)
  const shiftedNow = new Date(Date.now() + offsetMinutes * 60_000)

  const year = shiftedNow.getUTCFullYear()
  const month = shiftedNow.getUTCMonth()
  const day = shiftedNow.getUTCDate()
  const dayOfWeek = shiftedNow.getUTCDay()

  const localMidnightAsUtc = Date.UTC(year, month, day)
  const startOfTodayUtcMs =
    localMidnightAsUtc - offsetMinutes * 60_000

  const daysSinceMonday = (dayOfWeek + 6) % 7
  const startOfWeekLocalAsUtc = Date.UTC(
    year,
    month,
    day - daysSinceMonday,
  )

  const trendStartUtcMs =
    startOfTodayUtcMs - (TREND_DAYS - 1) * 24 * 60 * 60 * 1000

  return {
    todayDate: formatDateOnly(
      new Date(Date.UTC(year, month, day)),
    ),
    weekStartDate: formatDateOnly(
      new Date(startOfWeekLocalAsUtc),
    ),
    trendStartIso: new Date(trendStartUtcMs).toISOString(),
  }
}

const validateCheckInBody = (
  body: Record<string, unknown>,
):
  | {
      weightKg: number | null
      bodyFatPercentage: number | null
      photoUrl: string | null
      photoTag: string | null
      loggedAt: string
    }
  | {
      error: string
    } => {
  const weightProvided =
    body.weight_kg !== undefined &&
    body.weight_kg !== null &&
    body.weight_kg !== ''

  const bodyFatProvided =
    body.body_fat_percentage !== undefined &&
    body.body_fat_percentage !== null &&
    body.body_fat_percentage !== ''

  const photoUrl =
    typeof body.photo_url === 'string' && body.photo_url.trim()
      ? body.photo_url.trim()
      : null

  if (!weightProvided && !bodyFatProvided && !photoUrl) {
    return {
      error:
        'Provide at least one progress value: weight_kg, body_fat_percentage, or photo_url.',
    }
  }

  const weightKg = weightProvided
    ? toNumberOrNull(body.weight_kg)
    : null

  if (weightProvided && (weightKg === null || weightKg <= 0)) {
    return {
      error: 'weight_kg must be a number greater than 0.',
    }
  }

  const bodyFatPercentage = bodyFatProvided
    ? toNumberOrNull(body.body_fat_percentage)
    : null

  if (
    bodyFatProvided &&
    (bodyFatPercentage === null ||
      bodyFatPercentage < 0 ||
      bodyFatPercentage > 100)
  ) {
    return {
      error:
        'body_fat_percentage must be a number between 0 and 100.',
    }
  }

  const photoTag =
    typeof body.photo_tag === 'string' && body.photo_tag.trim()
      ? body.photo_tag.trim()
      : photoUrl
        ? 'front'
        : null

  let loggedAt = new Date().toISOString()

  if (
    typeof body.logged_at === 'string' &&
    body.logged_at.trim()
  ) {
    const parsedLoggedAt = new Date(body.logged_at)

    if (Number.isNaN(parsedLoggedAt.getTime())) {
      return {
        error: 'logged_at must be a valid ISO date/time.',
      }
    }

    loggedAt = parsedLoggedAt.toISOString()
  }

  return {
    weightKg,
    bodyFatPercentage,
    photoUrl,
    photoTag,
    loggedAt,
  }
}

const calculateGoalSummary = (
  profile: ProgressProfileRow,
  startingWeightKg: number | null,
): ProgressGoalSummary => {
  const currentWeightKg = toNumberOrNull(profile.current_weight_kg)
  const targetWeightKg = toNumberOrNull(profile.target_weight_kg)
  const effectiveStartingWeight =
    startingWeightKg ?? currentWeightKg

  const base: ProgressGoalSummary = {
    primary_goal: profile.primary_goal || 'maintain',
    current_weight_kg: currentWeightKg,
    target_weight_kg: targetWeightKg,
    starting_weight_kg: effectiveStartingWeight,
    weight_change_kg:
      currentWeightKg !== null &&
      effectiveStartingWeight !== null
        ? round(currentWeightKg - effectiveStartingWeight)
        : null,
    remaining_kg: null,
    progress_percentage: null,
  }

  if (
    currentWeightKg === null ||
    targetWeightKg === null ||
    effectiveStartingWeight === null
  ) {
    return base
  }

  const totalDistance = Math.abs(
    targetWeightKg - effectiveStartingWeight,
  )

  if (totalDistance === 0) {
    return {
      ...base,
      remaining_kg: 0,
      progress_percentage: 100,
    }
  }

  const direction =
    targetWeightKg >= effectiveStartingWeight ? 1 : -1

  const progressAmount =
    (currentWeightKg - effectiveStartingWeight) * direction

  const remainingAmount =
    (targetWeightKg - currentWeightKg) * direction

  return {
    ...base,
    remaining_kg: round(Math.max(remainingAmount, 0)),
    progress_percentage: round(
      clamp((progressAmount / totalDistance) * 100, 0, 100),
      1,
    ),
  }
}

export const getProgressOverview = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = getUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized.',
      })
    }

    const {
      todayDate,
      weekStartDate,
      trendStartIso,
    } = getClientDateContext(req)

    const [
      profileRes,
      earliestWeightRes,
      latestCheckInRes,
      trendRes,
      completedWorkoutsRes,
    ] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select(
          'full_name, primary_goal, current_weight_kg, target_weight_kg, workout_days_per_week',
        )
        .eq('id', userId)
        .single(),

      supabaseAdmin
        .from('progress_logs')
        .select(
          'id, user_id, weight_kg, body_fat_percentage, photo_url, photo_tag, logged_at',
        )
        .eq('user_id', userId)
        .not('weight_kg', 'is', null)
        .order('logged_at', { ascending: true })
        .limit(1)
        .maybeSingle(),

      supabaseAdmin
        .from('progress_logs')
        .select(
          'id, user_id, weight_kg, body_fat_percentage, photo_url, photo_tag, logged_at',
        )
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabaseAdmin
        .from('progress_logs')
        .select(
          'id, user_id, weight_kg, body_fat_percentage, photo_url, photo_tag, logged_at',
        )
        .eq('user_id', userId)
        .gte('logged_at', trendStartIso)
        .order('logged_at', { ascending: true }),

      supabaseAdmin
        .from('workout_sessions')
        .select(
          'id, workout_date, total_volume_kg, completed_at',
        )
        .eq('user_id', userId)
        .eq('status', 'completed'),
    ])

    if (profileRes.error || !profileRes.data) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found.',
      })
    }

    if (earliestWeightRes.error) {
      throw earliestWeightRes.error
    }

    if (latestCheckInRes.error) {
      throw latestCheckInRes.error
    }

    if (trendRes.error) {
      throw trendRes.error
    }

    if (completedWorkoutsRes.error) {
      throw completedWorkoutsRes.error
    }

    const profile =
      profileRes.data as unknown as ProgressProfileRow

    const earliestWeight =
      (earliestWeightRes.data ??
        null) as unknown as ProgressLogRow | null

    const latestCheckIn =
      (latestCheckInRes.data ??
        null) as unknown as ProgressLogRow | null

    const trendLogs =
      (trendRes.data ?? []) as unknown as ProgressLogRow[]

    const completedWorkouts =
      (completedWorkoutsRes.data ??
        []) as unknown as WorkoutSessionRow[]

    const startingWeightKg = toNumberOrNull(
      earliestWeight?.weight_kg,
    )

    const goal = calculateGoalSummary(
      profile,
      startingWeightKg,
    )

    const weightTrend = trendLogs
      .filter((log) => log.weight_kg !== null)
      .map((log) => ({
        id: log.id,
        weight_kg: toNumberOrNull(log.weight_kg),
        logged_at: log.logged_at,
      }))

    const bodyFatTrend = trendLogs
      .filter(
        (log) =>
          log.body_fat_percentage !== null,
      )
      .map((log) => ({
        id: log.id,
        body_fat_percentage:
          toNumberOrNull(
            log.body_fat_percentage,
          ),
        logged_at: log.logged_at,
      }))

    const workoutsThisWeek =
      completedWorkouts.filter(
        (session) =>
          session.workout_date >=
            weekStartDate &&
          session.workout_date <= todayDate,
      )

    const totalVolumeKg =
      completedWorkouts.reduce(
        (sum, session) =>
          sum +
          toNumberOrZero(
            session.total_volume_kg,
          ),
        0,
      )

    const averageVolumeKg =
      completedWorkouts.length > 0
        ? totalVolumeKg /
          completedWorkouts.length
        : 0

    return res.status(200).json({
      success: true,
      data: {
        goal,
        latest_check_in: latestCheckIn
          ? {
              id: latestCheckIn.id,
              weight_kg: toNumberOrNull(
                latestCheckIn.weight_kg,
              ),
              body_fat_percentage:
                toNumberOrNull(
                  latestCheckIn.body_fat_percentage,
                ),
              photo_url:
                latestCheckIn.photo_url,
              photo_tag:
                latestCheckIn.photo_tag,
              logged_at:
                latestCheckIn.logged_at,
            }
          : null,
        weight_trend: weightTrend,
        body_fat_trend: bodyFatTrend,
        training: {
          completed_workouts:
            completedWorkouts.length,
          workouts_this_week:
            workoutsThisWeek.length,
          workout_days_goal:
            profile.workout_days_per_week ??
            0,
          total_volume_kg:
            round(totalVolumeKg),
          average_volume_kg:
            round(averageVolumeKg),
        },
        meta: {
          trend_days: TREND_DAYS,
          week_start: weekStartDate,
          today: todayDate,
        },
      },
    })
  } catch (error: unknown) {
    console.error(
      '🔥 [Progress Overview Error]:',
      error,
    )

    return res.status(500).json({
      success: false,
      error: 'Failed to load progress overview.',
    })
  }
}

export const getProgressLogs = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = getUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized.',
      })
    }

    const requestedLimit = Number(
      req.query.limit ?? DEFAULT_LOG_LIMIT,
    )
    const requestedOffset = Number(
      req.query.offset ?? 0,
    )

    const limit = Number.isInteger(
      requestedLimit,
    )
      ? clamp(
          requestedLimit,
          1,
          MAX_LOG_LIMIT,
        )
      : DEFAULT_LOG_LIMIT

    const offset =
      Number.isInteger(requestedOffset) &&
      requestedOffset >= 0
        ? requestedOffset
        : 0

    const { data, error, count } =
      await supabaseAdmin
        .from('progress_logs')
        .select(
          'id, user_id, weight_kg, body_fat_percentage, photo_url, photo_tag, logged_at',
          { count: 'exact' },
        )
        .eq('user_id', userId)
        .order('logged_at', {
          ascending: false,
        })
        .range(
          offset,
          offset + limit - 1,
        )

    if (error) {
      throw error
    }

    const logs =
      (data ?? []) as unknown as ProgressLogRow[]

    return res.status(200).json({
      success: true,
      data: {
        logs: logs.map((log) => ({
          id: log.id,
          weight_kg: toNumberOrNull(
            log.weight_kg,
          ),
          body_fat_percentage:
            toNumberOrNull(
              log.body_fat_percentage,
            ),
          photo_url: log.photo_url,
          photo_tag: log.photo_tag,
          logged_at: log.logged_at,
        })),
        pagination: {
          limit,
          offset,
          total: count ?? logs.length,
          has_more:
            offset +
              logs.length <
            (count ?? logs.length),
        },
      },
    })
  } catch (error: unknown) {
    console.error(
      '🔥 [Progress Logs Error]:',
      error,
    )

    return res.status(500).json({
      success: false,
      error: 'Failed to load progress logs.',
    })
  }
}

export const createProgressLog = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = getUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized.',
      })
    }

    const validation =
      validateCheckInBody(
        (req.body ?? {}) as Record<
          string,
          unknown
        >,
      )

    if ('error' in validation) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      })
    }

    const {
      weightKg,
      bodyFatPercentage,
      photoUrl,
      photoTag,
      loggedAt,
    } = validation

    const { data, error } =
      await supabaseAdmin
        .from('progress_logs')
        .insert({
          user_id: userId,
          weight_kg: weightKg,
          body_fat_percentage:
            bodyFatPercentage,
          photo_url: photoUrl,
          photo_tag: photoTag,
          logged_at: loggedAt,
        })
        .select(
          'id, user_id, weight_kg, body_fat_percentage, photo_url, photo_tag, logged_at',
        )
        .single()

    if (error || !data) {
      throw error ?? new Error(
        'Failed to create progress log.',
      )
    }

    const createdLog =
      data as unknown as ProgressLogRow

    if (weightKg !== null) {
      const { error: profileUpdateError } =
        await supabaseAdmin
          .from('profiles')
          .update({
            current_weight_kg: weightKg,
            updated_at:
              new Date().toISOString(),
          })
          .eq('id', userId)

      if (profileUpdateError) {
        const {
          error: rollbackError,
        } = await supabaseAdmin
          .from('progress_logs')
          .delete()
          .eq('id', createdLog.id)
          .eq('user_id', userId)

        if (rollbackError) {
          console.error(
            '🔥 [Progress Rollback Error]:',
            rollbackError,
          )
        }

        throw profileUpdateError
      }
    }

    return res.status(201).json({
      success: true,
      message:
        'Progress check-in saved successfully.',
      data: {
        id: createdLog.id,
        weight_kg: toNumberOrNull(
          createdLog.weight_kg,
        ),
        body_fat_percentage:
          toNumberOrNull(
            createdLog.body_fat_percentage,
          ),
        photo_url:
          createdLog.photo_url,
        photo_tag:
          createdLog.photo_tag,
        logged_at:
          createdLog.logged_at,
      },
    })
  } catch (error: unknown) {
    console.error(
      '🔥 [Create Progress Log Error]:',
      error,
    )

    return res.status(500).json({
      success: false,
      error: 'Failed to save progress check-in.',
    })
  }
}

export const deleteProgressLog = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = getUserId(req)

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized.',
      })
    }

    const progressId =
      normalizeParam(
        req.params.progressId,
      )

    if (!progressId) {
      return res.status(400).json({
        success: false,
        error: 'Progress log ID is required.',
      })
    }

    const [
      targetRes,
      latestWeightBeforeDeleteRes,
    ] = await Promise.all([
      supabaseAdmin
        .from('progress_logs')
        .select(
          'id, user_id, weight_kg, body_fat_percentage, photo_url, photo_tag, logged_at',
        )
        .eq('id', progressId)
        .eq('user_id', userId)
        .maybeSingle(),

      supabaseAdmin
        .from('progress_logs')
        .select(
          'id, user_id, weight_kg, body_fat_percentage, photo_url, photo_tag, logged_at',
        )
        .eq('user_id', userId)
        .not('weight_kg', 'is', null)
        .order('logged_at', {
          ascending: false,
        })
        .limit(1)
        .maybeSingle(),
    ])

    if (targetRes.error) {
      throw targetRes.error
    }

    if (
      latestWeightBeforeDeleteRes.error
    ) {
      throw latestWeightBeforeDeleteRes.error
    }

    if (!targetRes.data) {
      return res.status(404).json({
        success: false,
        error: 'Progress log not found.',
      })
    }

    const target =
      targetRes.data as unknown as ProgressLogRow

    const latestWeightBeforeDelete =
      (latestWeightBeforeDeleteRes.data ??
        null) as unknown as ProgressLogRow | null

    const deletingLatestWeight =
      target.weight_kg !== null &&
      latestWeightBeforeDelete?.id ===
        target.id

    const { error: deleteError } =
      await supabaseAdmin
        .from('progress_logs')
        .delete()
        .eq('id', progressId)
        .eq('user_id', userId)

    if (deleteError) {
      throw deleteError
    }

    if (deletingLatestWeight) {
      const {
        data: nextWeightData,
        error: nextWeightError,
      } = await supabaseAdmin
        .from('progress_logs')
        .select(
          'id, user_id, weight_kg, body_fat_percentage, photo_url, photo_tag, logged_at',
        )
        .eq('user_id', userId)
        .not('weight_kg', 'is', null)
        .order('logged_at', {
          ascending: false,
        })
        .limit(1)
        .maybeSingle()

      if (nextWeightError) {
        throw nextWeightError
      }

      const nextWeightLog =
        (nextWeightData ??
          null) as unknown as ProgressLogRow | null

      const nextWeightKg =
        toNumberOrNull(
          nextWeightLog?.weight_kg,
        )

      if (nextWeightKg !== null) {
        const {
          error: profileUpdateError,
        } = await supabaseAdmin
          .from('profiles')
          .update({
            current_weight_kg:
              nextWeightKg,
            updated_at:
              new Date().toISOString(),
          })
          .eq('id', userId)

        if (profileUpdateError) {
          throw profileUpdateError
        }
      }
    }

    return res.status(200).json({
      success: true,
      message:
        'Progress log deleted successfully.',
    })
  } catch (error: unknown) {
    console.error(
      '🔥 [Delete Progress Log Error]:',
      error,
    )

    return res.status(500).json({
      success: false,
      error: 'Failed to delete progress log.',
    })
  }
}