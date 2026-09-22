import type { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { supabaseAdmin } from '../config/supabase.js'

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string
  }
}

type UnitSystem = 'metric' | 'imperial'
type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
type FitnessExperience =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
type PrimaryGoal =
  | 'lose_weight'
  | 'lose_fat'
  | 'maintain'
  | 'maintain_weight'
  | 'gain_muscle'

interface SettingsProfileRow {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  age: number | null
  gender: string | null
  height_cm: number | string | null
  current_weight_kg: number | string | null
  activity_level: string | null
  fitness_experience: string | null
  unit_system: string | null
  primary_goal: string | null
  target_weight_kg: number | string | null
  daily_calories: number | null
  protein_grams: number | null
  carbs_grams: number | null
  fat_grams: number | null
  workout_days_per_week: number | null
  streak_count: number | null
  is_onboarded: boolean | null
  email_verified: boolean
  updated_at: string | null
}

const PROFILE_SELECT =
  'id, email, full_name, avatar_url, age, gender, height_cm, current_weight_kg, activity_level, fitness_experience, unit_system, primary_goal, target_weight_kg, daily_calories, protein_grams, carbs_grams, fat_grams, workout_days_per_week, streak_count, is_onboarded, email_verified, updated_at'

const getUserId = (req: Request): string | null => {
  const userId = (req as AuthenticatedRequest).user?.id
  return typeof userId === 'string' && userId.trim() ? userId : null
}

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const asTrimmedString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const ACTIVITY_LEVELS = new Set<ActivityLevel>([
  'sedentary',
  'lightly_active',
  'moderately_active',
  'very_active',
])

const FITNESS_EXPERIENCE = new Set<FitnessExperience>([
  'beginner',
  'intermediate',
  'advanced',
])

const UNIT_SYSTEMS = new Set<UnitSystem>([
  'metric',
  'imperial',
])

const PRIMARY_GOALS = new Set<PrimaryGoal>([
  'lose_weight',
  'lose_fat',
  'maintain',
  'maintain_weight',
  'gain_muscle',
])

const loadSettingsProfile = async (
  userId: string,
): Promise<SettingsProfileRow | null> => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return (data ?? null) as unknown as SettingsProfileRow | null
}

const toSettingsResponse = (profile: SettingsProfileRow) => ({
  account: {
    id: profile.id,
    email: profile.email,
    email_verified: profile.email_verified,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
  },
  profile: {
    age: profile.age,
    gender: profile.gender,
    height_cm: toNumberOrNull(profile.height_cm),
    current_weight_kg: toNumberOrNull(profile.current_weight_kg),
    activity_level: profile.activity_level,
    fitness_experience: profile.fitness_experience,
    unit_system: profile.unit_system,
  },
  goals: {
    primary_goal: profile.primary_goal,
    target_weight_kg: toNumberOrNull(profile.target_weight_kg),
    daily_calories: profile.daily_calories,
    protein_grams: profile.protein_grams,
    carbs_grams: profile.carbs_grams,
    fat_grams: profile.fat_grams,
  },
  workout: {
    workout_days_per_week: profile.workout_days_per_week,
  },
  meta: {
    streak_count: profile.streak_count ?? 0,
    is_onboarded: Boolean(profile.is_onboarded),
    updated_at: profile.updated_at,
  },
})

export const getSettings = async (
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

    const profile = await loadSettingsProfile(userId)

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found.',
      })
    }

    return res.status(200).json({
      success: true,
      data: toSettingsResponse(profile),
    })
  } catch (error: unknown) {
    console.error('🔥 [Settings Get Error]:', error)

    return res.status(500).json({
      success: false,
      error: 'Failed to load settings.',
    })
  }
}

export const updateProfileSettings = async (
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

    const body = (req.body ?? {}) as Record<string, unknown>
    const updates: Record<string, unknown> = {}

    if (body.full_name !== undefined) {
      const fullName = asTrimmedString(body.full_name)

      if (!fullName) {
        return res.status(400).json({
          success: false,
          error: 'full_name is required.',
        })
      }

      if (fullName.length > 120) {
        return res.status(400).json({
          success: false,
          error: 'full_name must be 120 characters or fewer.',
        })
      }

      updates.full_name = fullName
    }

    if (body.avatar_url !== undefined) {
      if (body.avatar_url === null || body.avatar_url === '') {
        updates.avatar_url = null
      } else {
        const avatarUrl = asTrimmedString(body.avatar_url)

        if (!avatarUrl || !isHttpUrl(avatarUrl)) {
          return res.status(400).json({
            success: false,
            error: 'avatar_url must be a valid http or https URL.',
          })
        }

        updates.avatar_url = avatarUrl
      }
    }

    if (body.age !== undefined) {
      const age = Number(body.age)

      if (!Number.isInteger(age) || age < 13 || age > 120) {
        return res.status(400).json({
          success: false,
          error: 'age must be a whole number between 13 and 120.',
        })
      }

      updates.age = age
    }

    if (body.gender !== undefined) {
      const gender = asTrimmedString(body.gender)

      if (!gender || gender.length > 40) {
        return res.status(400).json({
          success: false,
          error: 'gender must be a non-empty value up to 40 characters.',
        })
      }

      updates.gender = gender
    }

    if (body.height_cm !== undefined) {
      const heightCm = toNumberOrNull(body.height_cm)

      if (heightCm === null || heightCm < 80 || heightCm > 260) {
        return res.status(400).json({
          success: false,
          error: 'height_cm must be between 80 and 260.',
        })
      }

      updates.height_cm = heightCm
    }

    let newWeightKg: number | null = null

    if (body.current_weight_kg !== undefined) {
      const weightKg = toNumberOrNull(body.current_weight_kg)

      if (weightKg === null || weightKg < 25 || weightKg > 400) {
        return res.status(400).json({
          success: false,
          error: 'current_weight_kg must be between 25 and 400.',
        })
      }

      updates.current_weight_kg = weightKg
      newWeightKg = weightKg
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid profile fields were provided.',
      })
    }

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select(PROFILE_SELECT)
      .single()

    if (error || !data) {
      throw error ?? new Error('Failed to update profile settings.')
    }

    if (newWeightKg !== null) {
      const { error: progressError } = await supabaseAdmin
        .from('progress_logs')
        .insert({
          user_id: userId,
          weight_kg: newWeightKg,
          logged_at: new Date().toISOString(),
        })

      if (progressError) {
        console.error(
          '🔥 [Settings Weight Progress Sync Error]:',
          progressError,
        )
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Profile settings updated successfully.',
      data: toSettingsResponse(
        data as unknown as SettingsProfileRow,
      ),
    })
  } catch (error: unknown) {
    console.error('🔥 [Settings Profile Update Error]:', error)

    return res.status(500).json({
      success: false,
      error: 'Failed to update profile settings.',
    })
  }
}

export const updateGoalSettings = async (
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

    const body = (req.body ?? {}) as Record<string, unknown>
    const updates: Record<string, unknown> = {}

    if (body.primary_goal !== undefined) {
      const goal = asTrimmedString(body.primary_goal) as PrimaryGoal | null

      if (!goal || !PRIMARY_GOALS.has(goal)) {
        return res.status(400).json({
          success: false,
          error:
            'primary_goal must be one of: lose_weight, lose_fat, maintain, maintain_weight, gain_muscle.',
        })
      }

      updates.primary_goal = goal
    }

    if (body.target_weight_kg !== undefined) {
      if (
        body.target_weight_kg === null ||
        body.target_weight_kg === ''
      ) {
        updates.target_weight_kg = null
      } else {
        const targetWeightKg = toNumberOrNull(body.target_weight_kg)

        if (
          targetWeightKg === null ||
          targetWeightKg < 25 ||
          targetWeightKg > 400
        ) {
          return res.status(400).json({
            success: false,
            error: 'target_weight_kg must be between 25 and 400.',
          })
        }

        updates.target_weight_kg = targetWeightKg
      }
    }

    const macroFields = [
      ['daily_calories', 500, 10000],
      ['protein_grams', 0, 1000],
      ['carbs_grams', 0, 1500],
      ['fat_grams', 0, 500],
    ] as const

    for (const [field, min, max] of macroFields) {
      if (body[field] === undefined) continue

      const value = Number(body[field])

      if (!Number.isInteger(value) || value < min || value > max) {
        return res.status(400).json({
          success: false,
          error: `${field} must be a whole number between ${min} and ${max}.`,
        })
      }

      updates[field] = value
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid goal fields were provided.',
      })
    }

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select(PROFILE_SELECT)
      .single()

    if (error || !data) {
      throw error ?? new Error('Failed to update goal settings.')
    }

    return res.status(200).json({
      success: true,
      message: 'Goal and nutrition settings updated successfully.',
      data: toSettingsResponse(
        data as unknown as SettingsProfileRow,
      ),
    })
  } catch (error: unknown) {
    console.error('🔥 [Settings Goal Update Error]:', error)

    return res.status(500).json({
      success: false,
      error: 'Failed to update goal settings.',
    })
  }
}

export const updatePreferenceSettings = async (
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

    const body = (req.body ?? {}) as Record<string, unknown>
    const updates: Record<string, unknown> = {}

    if (body.activity_level !== undefined) {
      const activityLevel =
        asTrimmedString(body.activity_level) as ActivityLevel | null

      if (!activityLevel || !ACTIVITY_LEVELS.has(activityLevel)) {
        return res.status(400).json({
          success: false,
          error:
            'activity_level must be one of: sedentary, lightly_active, moderately_active, very_active.',
        })
      }

      updates.activity_level = activityLevel
    }

    if (body.fitness_experience !== undefined) {
      const experience =
        asTrimmedString(
          body.fitness_experience,
        ) as FitnessExperience | null

      if (!experience || !FITNESS_EXPERIENCE.has(experience)) {
        return res.status(400).json({
          success: false,
          error:
            'fitness_experience must be one of: beginner, intermediate, advanced.',
        })
      }

      updates.fitness_experience = experience
    }

    if (body.unit_system !== undefined) {
      const unitSystem =
        asTrimmedString(body.unit_system) as UnitSystem | null

      if (!unitSystem || !UNIT_SYSTEMS.has(unitSystem)) {
        return res.status(400).json({
          success: false,
          error: 'unit_system must be either metric or imperial.',
        })
      }

      updates.unit_system = unitSystem
    }

    if (body.workout_days_per_week !== undefined) {
      const workoutDays = Number(body.workout_days_per_week)

      if (
        !Number.isInteger(workoutDays) ||
        workoutDays < 0 ||
        workoutDays > 7
      ) {
        return res.status(400).json({
          success: false,
          error: 'workout_days_per_week must be between 0 and 7.',
        })
      }

      updates.workout_days_per_week = workoutDays
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid preference fields were provided.',
      })
    }

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select(PROFILE_SELECT)
      .single()

    if (error || !data) {
      throw error ?? new Error('Failed to update preference settings.')
    }

    return res.status(200).json({
      success: true,
      message: 'Preferences updated successfully.',
      data: toSettingsResponse(
        data as unknown as SettingsProfileRow,
      ),
    })
  } catch (error: unknown) {
    console.error('🔥 [Settings Preferences Update Error]:', error)

    return res.status(500).json({
      success: false,
      error: 'Failed to update preference settings.',
    })
  }
}

export const changePassword = async (
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

    const body = (req.body ?? {}) as Record<string, unknown>
    const currentPassword = asTrimmedString(body.current_password)
    const newPassword = asTrimmedString(body.new_password)

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'current_password and new_password are required.',
      })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'new_password must be at least 8 characters.',
      })
    }

    if (newPassword.length > 128) {
      return res.status(400).json({
        success: false,
        error: 'new_password must be 128 characters or fewer.',
      })
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        error: 'new_password must be different from the current password.',
      })
    }

    const { data: account, error: accountError } =
      await supabaseAdmin
        .from('profiles')
        .select('id, password_hash')
        .eq('id', userId)
        .single()

    if (accountError || !account) {
      return res.status(404).json({
        success: false,
        error: 'User account not found.',
      })
    }

    const passwordHash = String(
      (account as { password_hash?: string }).password_hash ?? '',
    )

    const matches = await bcrypt.compare(
      currentPassword,
      passwordHash,
    )

    if (!matches) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect.',
      })
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12)

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      throw updateError
    }

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    })
  } catch (error: unknown) {
    console.error('🔥 [Settings Password Error]:', error)

    return res.status(500).json({
      success: false,
      error: 'Failed to change password.',
    })
  }
}
