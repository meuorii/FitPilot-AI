import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

import { supabaseAdmin } from '../config/supabase.js';

type UnitSystem = 'metric' | 'imperial';

type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active';

type FitnessExperience =
  | 'beginner'
  | 'intermediate'
  | 'advanced';

type PrimaryGoal =
  | 'lose_weight'
  | 'lose_fat'
  | 'maintain'
  | 'maintain_weight'
  | 'gain_muscle';

interface SettingsProfileRow {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  age: number | null;
  gender: string | null;
  height_cm: number | string | null;
  current_weight_kg: number | string | null;
  activity_level: string | null;
  fitness_experience: string | null;
  unit_system: string | null;
  primary_goal: string | null;
  target_weight_kg: number | string | null;
  daily_calories: number | null;
  protein_grams: number | null;
  carbs_grams: number | null;
  fat_grams: number | null;
  workout_days_per_week: number | null;
  streak_count: number | null;
  is_onboarded: boolean | null;
  email_verified: boolean;
  updated_at: string | null;
}

interface PasswordRow {
  id: string;
  password_hash: string;
}

const PROFILE_SELECT =
  'id, email, full_name, avatar_url, age, gender, height_cm, current_weight_kg, activity_level, fitness_experience, unit_system, primary_goal, target_weight_kg, daily_calories, protein_grams, carbs_grams, fat_grams, workout_days_per_week, streak_count, is_onboarded, email_verified, updated_at' as const;

const ACTIVITY_LEVELS = new Set<ActivityLevel>([
  'sedentary',
  'lightly_active',
  'moderately_active',
  'very_active',
]);

const FITNESS_EXPERIENCE_LEVELS = new Set<FitnessExperience>([
  'beginner',
  'intermediate',
  'advanced',
]);

const UNIT_SYSTEMS = new Set<UnitSystem>([
  'metric',
  'imperial',
]);

const PRIMARY_GOALS = new Set<PrimaryGoal>([
  'lose_weight',
  'lose_fat',
  'maintain',
  'maintain_weight',
  'gain_muscle',
]);

const PROFILE_AVATAR_BUCKET = 'profile-avatars';

const AVATAR_EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const getOwnedAvatarStoragePath = (
  avatarUrl: string | null,
  userId: string,
): string | null => {
  if (!avatarUrl) {
    return null;
  }

  try {
    const url = new URL(avatarUrl);
    const marker = `/storage/v1/object/public/${PROFILE_AVATAR_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex < 0) {
      return null;
    }

    const encodedPath = url.pathname.slice(
      markerIndex + marker.length,
    );

    const path = decodeURIComponent(encodedPath);

    return path.startsWith(`${userId}/`)
      ? path
      : null;
  } catch {
    return null;
  }
};

const removeAvatarObject = async (
  path: string | null,
): Promise<void> => {
  if (!path) {
    return;
  }

  const { error } = await supabaseAdmin.storage
    .from(PROFILE_AVATAR_BUCKET)
    .remove([path]);

  if (error) {
    console.error(
      '🔥 [Settings Avatar Storage Cleanup Error]:',
      error,
    );
  }
};

const getUserId = (req: Request): string | null => {
  const userId = req.user?.id;

  return typeof userId === 'string' && userId.trim()
    ? userId
    : null;
};

const asTrimmedString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : null;
};

const toNumberOrNull = (value: unknown): number | null => {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
};

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);

    return (
      url.protocol === 'http:' ||
      url.protocol === 'https:'
    );
  } catch {
    return false;
  }
};

const loadSettingsProfile = async (
  userId: string,
): Promise<SettingsProfileRow | null> => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (
    (data ?? null) as
      | SettingsProfileRow
      | null
  );
};

const toSettingsResponse = (
  profile: SettingsProfileRow,
) => ({
  account: {
    id: profile.id,
    email: profile.email,
    email_verified:
      profile.email_verified,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
  },

  profile: {
    age: profile.age,
    gender: profile.gender,
    height_cm: toNumberOrNull(
      profile.height_cm,
    ),
    current_weight_kg:
      toNumberOrNull(
        profile.current_weight_kg,
      ),
    activity_level:
      profile.activity_level,
    fitness_experience:
      profile.fitness_experience,
    unit_system:
      profile.unit_system,
  },

  goals: {
    primary_goal:
      profile.primary_goal,
    target_weight_kg:
      toNumberOrNull(
        profile.target_weight_kg,
      ),
    daily_calories:
      profile.daily_calories,
    protein_grams:
      profile.protein_grams,
    carbs_grams:
      profile.carbs_grams,
    fat_grams:
      profile.fat_grams,
  },

  workout: {
    workout_days_per_week:
      profile.workout_days_per_week,
  },

  meta: {
    streak_count:
      profile.streak_count ?? 0,
    is_onboarded: Boolean(
      profile.is_onboarded,
    ),
    updated_at:
      profile.updated_at,
  },
});

const respondUnauthorized = (
  res: Response,
) =>
  res.status(401).json({
    success: false,
    error: 'Unauthorized.',
  });

const respondProfileNotFound = (
  res: Response,
) =>
  res.status(404).json({
    success: false,
    error: 'User profile not found.',
  });

// -----------------------------------------------------------------------------
// GET /api/v1/settings
// -----------------------------------------------------------------------------

export const getSettings = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return respondUnauthorized(res);
    }

    const profile =
      await loadSettingsProfile(userId);

    if (!profile) {
      return respondProfileNotFound(res);
    }

    return res.status(200).json({
      success: true,
      data: toSettingsResponse(profile),
    });
  } catch (error: unknown) {
    console.error(
      '🔥 [Settings Get Error]:',
      error,
    );

    return res.status(500).json({
      success: false,
      error:
        'Failed to load settings.',
    });
  }
};

// -----------------------------------------------------------------------------
// PATCH /api/v1/settings/profile
// -----------------------------------------------------------------------------

export const updateProfileSettings =
  async (
    req: Request,
    res: Response,
  ) => {
    let insertedProgressLogId:
      | string
      | null = null;

    try {
      const userId = getUserId(req);

      if (!userId) {
        return respondUnauthorized(res);
      }

      const body =
        (req.body ?? {}) as Record<
          string,
          unknown
        >;

      const updates: Record<
        string,
        unknown
      > = {};

      if (
        body.full_name !== undefined
      ) {
        const fullName =
          asTrimmedString(
            body.full_name,
          );

        if (!fullName) {
          return res.status(400).json({
            success: false,
            error:
              'full_name is required.',
          });
        }

        if (
          fullName.length > 120
        ) {
          return res.status(400).json({
            success: false,
            error:
              'full_name must be 120 characters or fewer.',
          });
        }

        updates.full_name =
          fullName;
      }

      if (
        body.avatar_url !== undefined
      ) {
        if (
          body.avatar_url === null ||
          body.avatar_url === ''
        ) {
          updates.avatar_url = null;
        } else {
          const avatarUrl =
            asTrimmedString(
              body.avatar_url,
            );

          if (
            !avatarUrl ||
            !isHttpUrl(avatarUrl)
          ) {
            return res.status(400).json({
              success: false,
              error:
                'avatar_url must be a valid http or https URL.',
            });
          }

          updates.avatar_url =
            avatarUrl;
        }
      }

      if (body.age !== undefined) {
        const age = Number(body.age);

        if (
          !Number.isInteger(age) ||
          age < 13 ||
          age > 120
        ) {
          return res.status(400).json({
            success: false,
            error:
              'age must be a whole number between 13 and 120.',
          });
        }

        updates.age = age;
      }

      if (
        body.gender !== undefined
      ) {
        const gender =
          asTrimmedString(
            body.gender,
          );

        if (
          !gender ||
          gender.length > 40
        ) {
          return res.status(400).json({
            success: false,
            error:
              'gender must be a non-empty value up to 40 characters.',
          });
        }

        updates.gender = gender;
      }

      if (
        body.height_cm !== undefined
      ) {
        const heightCm =
          toNumberOrNull(
            body.height_cm,
          );

        if (
          heightCm === null ||
          heightCm < 80 ||
          heightCm > 260
        ) {
          return res.status(400).json({
            success: false,
            error:
              'height_cm must be between 80 and 260.',
          });
        }

        updates.height_cm =
          heightCm;
      }

      let newWeightKg:
        | number
        | null = null;

      if (
        body.current_weight_kg !==
        undefined
      ) {
        const weightKg =
          toNumberOrNull(
            body.current_weight_kg,
          );

        if (
          weightKg === null ||
          weightKg < 25 ||
          weightKg > 400
        ) {
          return res.status(400).json({
            success: false,
            error:
              'current_weight_kg must be between 25 and 400.',
          });
        }

        updates.current_weight_kg =
          weightKg;
        newWeightKg = weightKg;
      }

      if (
        Object.keys(updates).length ===
        0
      ) {
        return res.status(400).json({
          success: false,
          error:
            'No valid profile fields were provided.',
        });
      }

      const existingProfile =
        await loadSettingsProfile(
          userId,
        );

      if (!existingProfile) {
        return respondProfileNotFound(
          res,
        );
      }

      const previousWeightKg =
        toNumberOrNull(
          existingProfile.current_weight_kg,
        );

      const weightChanged =
        newWeightKg !== null &&
        newWeightKg !==
          previousWeightKg;

      /*
       * Keep Settings and Progress consistent:
       * create the progress row first only if
       * the weight actually changed.
       */
      if (weightChanged) {
        const {
          data: progressLog,
          error: progressError,
        } = await supabaseAdmin
          .from('progress_logs')
          .insert({
            user_id: userId,
            weight_kg:
              newWeightKg,
            logged_at:
              new Date().toISOString(),
          })
          .select('id')
          .single();

        if (
          progressError ||
          !progressLog
        ) {
          throw (
            progressError ??
            new Error(
              'Failed to sync weight with progress history.',
            )
          );
        }

        insertedProgressLogId =
          String(progressLog.id);
      }

      updates.updated_at =
        new Date().toISOString();

      const {
        data,
        error,
      } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select(PROFILE_SELECT)
        .maybeSingle();

      if (error || !data) {
        /*
         * Profile update failed after a
         * progress row was created.
         * Remove that row so the two
         * sources remain aligned.
         */
        if (
          insertedProgressLogId
        ) {
          const {
            error: rollbackError,
          } = await supabaseAdmin
            .from('progress_logs')
            .delete()
            .eq(
              'id',
              insertedProgressLogId,
            )
            .eq(
              'user_id',
              userId,
            );

          if (rollbackError) {
            console.error(
              '🔥 [Settings Weight Sync Rollback Error]:',
              rollbackError,
            );
          }
        }

        if (error) {
          throw error;
        }

        return respondProfileNotFound(
          res,
        );
      }

      return res.status(200).json({
        success: true,
        message:
          'Profile settings updated successfully.',
        data: toSettingsResponse(
          data as SettingsProfileRow,
        ),
      });
    } catch (error: unknown) {
      console.error(
        '🔥 [Settings Profile Update Error]:',
        error,
      );

      return res.status(500).json({
        success: false,
        error:
          'Failed to update profile settings.',
      });
    }
  };


// -----------------------------------------------------------------------------
// PATCH /api/v1/settings/avatar
// multipart/form-data field: avatar
// -----------------------------------------------------------------------------

export const updateAvatar = async (
  req: Request,
  res: Response,
) => {
  let uploadedPath: string | null = null;

  try {
    const userId = getUserId(req);

    if (!userId) {
      return respondUnauthorized(res);
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Avatar image is required.',
      });
    }

    const extension =
      AVATAR_EXTENSION_BY_MIME[req.file.mimetype];

    if (!extension) {
      return res.status(400).json({
        success: false,
        error:
          'Avatar must be a JPG, PNG, or WebP image.',
      });
    }

    const currentProfile =
      await loadSettingsProfile(userId);

    if (!currentProfile) {
      return respondProfileNotFound(res);
    }

    uploadedPath =
      `${userId}/${randomUUID()}.${extension}`;

    const avatarStorage =
      supabaseAdmin.storage.from(
        PROFILE_AVATAR_BUCKET,
      );

    const {
      error: uploadError,
    } = await avatarStorage.upload(
      uploadedPath,
      req.file.buffer,
      {
        contentType: req.file.mimetype,
        upsert: false,
        cacheControl: '3600',
      },
    );

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: publicUrlData,
    } = avatarStorage.getPublicUrl(
      uploadedPath,
    );

    const avatarUrl =
      publicUrlData.publicUrl;

    if (!avatarUrl) {
      await removeAvatarObject(
        uploadedPath,
      );
      uploadedPath = null;

      throw new Error(
        'Failed to create the avatar public URL.',
      );
    }

    const {
      data,
      error,
    } = await supabaseAdmin
      .from('profiles')
      .update({
        avatar_url: avatarUrl,
        updated_at:
          new Date().toISOString(),
      })
      .eq('id', userId)
      .select(PROFILE_SELECT)
      .maybeSingle();

    if (error || !data) {
      await removeAvatarObject(
        uploadedPath,
      );
      uploadedPath = null;

      if (error) {
        throw error;
      }

      return respondProfileNotFound(res);
    }

    /*
     * The database already points to the new file.
     * Old storage cleanup is best-effort so a cleanup
     * failure never rolls the user back to a stale avatar.
     */
    const previousAvatarPath =
      getOwnedAvatarStoragePath(
        currentProfile.avatar_url,
        userId,
      );

    if (
      previousAvatarPath &&
      previousAvatarPath !==
        uploadedPath
    ) {
      await removeAvatarObject(
        previousAvatarPath,
      );
    }

    uploadedPath = null;

    return res.status(200).json({
      success: true,
      message:
        'Profile photo updated successfully.',
      data: toSettingsResponse(
        data as SettingsProfileRow,
      ),
    });
  } catch (error: unknown) {
    if (uploadedPath) {
      await removeAvatarObject(
        uploadedPath,
      );
    }

    console.error(
      '🔥 [Settings Avatar Update Error]:',
      error,
    );

    return res.status(500).json({
      success: false,
      error:
        'Failed to update profile photo.',
    });
  }
};

// -----------------------------------------------------------------------------
// DELETE /api/v1/settings/avatar
// -----------------------------------------------------------------------------

export const removeAvatar = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return respondUnauthorized(res);
    }

    const currentProfile =
      await loadSettingsProfile(userId);

    if (!currentProfile) {
      return respondProfileNotFound(res);
    }

    if (!currentProfile.avatar_url) {
      return res.status(200).json({
        success: true,
        message:
          'Profile photo is already removed.',
        data: toSettingsResponse(
          currentProfile,
        ),
      });
    }

    const oldAvatarPath =
      getOwnedAvatarStoragePath(
        currentProfile.avatar_url,
        userId,
      );

    const {
      data,
      error,
    } = await supabaseAdmin
      .from('profiles')
      .update({
        avatar_url: null,
        updated_at:
          new Date().toISOString(),
      })
      .eq('id', userId)
      .select(PROFILE_SELECT)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return respondProfileNotFound(res);
    }

    /*
     * Clear the DB first. If object cleanup fails,
     * the account no longer references the old file.
     */
    await removeAvatarObject(
      oldAvatarPath,
    );

    return res.status(200).json({
      success: true,
      message:
        'Profile photo removed successfully.',
      data: toSettingsResponse(
        data as SettingsProfileRow,
      ),
    });
  } catch (error: unknown) {
    console.error(
      '🔥 [Settings Avatar Remove Error]:',
      error,
    );

    return res.status(500).json({
      success: false,
      error:
        'Failed to remove profile photo.',
    });
  }
};

// -----------------------------------------------------------------------------
// PATCH /api/v1/settings/goals
// -----------------------------------------------------------------------------

export const updateGoalSettings =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const userId = getUserId(req);

      if (!userId) {
        return respondUnauthorized(res);
      }

      const body =
        (req.body ?? {}) as Record<
          string,
          unknown
        >;

      const updates: Record<
        string,
        unknown
      > = {};

      if (
        body.primary_goal !==
        undefined
      ) {
        const goal =
          asTrimmedString(
            body.primary_goal,
          ) as PrimaryGoal | null;

        if (
          !goal ||
          !PRIMARY_GOALS.has(goal)
        ) {
          return res.status(400).json({
            success: false,
            error:
              'primary_goal must be one of: lose_weight, lose_fat, maintain, maintain_weight, gain_muscle.',
          });
        }

        updates.primary_goal =
          goal;
      }

      if (
        body.target_weight_kg !==
        undefined
      ) {
        if (
          body.target_weight_kg ===
            null ||
          body.target_weight_kg === ''
        ) {
          updates.target_weight_kg =
            null;
        } else {
          const targetWeightKg =
            toNumberOrNull(
              body.target_weight_kg,
            );

          if (
            targetWeightKg === null ||
            targetWeightKg < 25 ||
            targetWeightKg > 400
          ) {
            return res.status(400).json({
              success: false,
              error:
                'target_weight_kg must be between 25 and 400.',
            });
          }

          updates.target_weight_kg =
            targetWeightKg;
        }
      }

      const integerFields = [
        {
          key: 'daily_calories',
          min: 500,
          max: 10000,
        },
        {
          key: 'protein_grams',
          min: 0,
          max: 1000,
        },
        {
          key: 'carbs_grams',
          min: 0,
          max: 1500,
        },
        {
          key: 'fat_grams',
          min: 0,
          max: 500,
        },
      ] as const;

      for (
        const {
          key,
          min,
          max,
        } of integerFields
      ) {
        if (
          body[key] === undefined
        ) {
          continue;
        }

        const value = Number(
          body[key],
        );

        if (
          !Number.isInteger(value) ||
          value < min ||
          value > max
        ) {
          return res.status(400).json({
            success: false,
            error: `${key} must be a whole number between ${min} and ${max}.`,
          });
        }

        updates[key] = value;
      }

      if (
        Object.keys(updates).length ===
        0
      ) {
        return res.status(400).json({
          success: false,
          error:
            'No valid goal fields were provided.',
        });
      }

      updates.updated_at =
        new Date().toISOString();

      const {
        data,
        error,
      } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select(PROFILE_SELECT)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return respondProfileNotFound(
          res,
        );
      }

      return res.status(200).json({
        success: true,
        message:
          'Goal and nutrition settings updated successfully.',
        data: toSettingsResponse(
          data as SettingsProfileRow,
        ),
      });
    } catch (error: unknown) {
      console.error(
        '🔥 [Settings Goal Update Error]:',
        error,
      );

      return res.status(500).json({
        success: false,
        error:
          'Failed to update goal settings.',
      });
    }
  };

// -----------------------------------------------------------------------------
// PATCH /api/v1/settings/preferences
// -----------------------------------------------------------------------------

export const updatePreferenceSettings =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const userId = getUserId(req);

      if (!userId) {
        return respondUnauthorized(res);
      }

      const body =
        (req.body ?? {}) as Record<
          string,
          unknown
        >;

      const updates: Record<
        string,
        unknown
      > = {};

      if (
        body.activity_level !==
        undefined
      ) {
        const activityLevel =
          asTrimmedString(
            body.activity_level,
          ) as ActivityLevel | null;

        if (
          !activityLevel ||
          !ACTIVITY_LEVELS.has(
            activityLevel,
          )
        ) {
          return res.status(400).json({
            success: false,
            error:
              'activity_level must be one of: sedentary, lightly_active, moderately_active, very_active.',
          });
        }

        updates.activity_level =
          activityLevel;
      }

      if (
        body.fitness_experience !==
        undefined
      ) {
        const experience =
          asTrimmedString(
            body.fitness_experience,
          ) as
            | FitnessExperience
            | null;

        if (
          !experience ||
          !FITNESS_EXPERIENCE_LEVELS.has(
            experience,
          )
        ) {
          return res.status(400).json({
            success: false,
            error:
              'fitness_experience must be one of: beginner, intermediate, advanced.',
          });
        }

        updates.fitness_experience =
          experience;
      }

      if (
        body.unit_system !==
        undefined
      ) {
        const unitSystem =
          asTrimmedString(
            body.unit_system,
          ) as UnitSystem | null;

        if (
          !unitSystem ||
          !UNIT_SYSTEMS.has(
            unitSystem,
          )
        ) {
          return res.status(400).json({
            success: false,
            error:
              'unit_system must be either metric or imperial.',
          });
        }

        updates.unit_system =
          unitSystem;
      }

      if (
        body.workout_days_per_week !==
        undefined
      ) {
        const workoutDays =
          Number(
            body.workout_days_per_week,
          );

        if (
          !Number.isInteger(
            workoutDays,
          ) ||
          workoutDays < 0 ||
          workoutDays > 7
        ) {
          return res.status(400).json({
            success: false,
            error:
              'workout_days_per_week must be between 0 and 7.',
          });
        }

        updates.workout_days_per_week =
          workoutDays;
      }

      if (
        Object.keys(updates).length ===
        0
      ) {
        return res.status(400).json({
          success: false,
          error:
            'No valid preference fields were provided.',
        });
      }

      updates.updated_at =
        new Date().toISOString();

      const {
        data,
        error,
      } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select(PROFILE_SELECT)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return respondProfileNotFound(
          res,
        );
      }

      return res.status(200).json({
        success: true,
        message:
          'Preferences updated successfully.',
        data: toSettingsResponse(
          data as SettingsProfileRow,
        ),
      });
    } catch (error: unknown) {
      console.error(
        '🔥 [Settings Preferences Update Error]:',
        error,
      );

      return res.status(500).json({
        success: false,
        error:
          'Failed to update preference settings.',
      });
    }
  };

// -----------------------------------------------------------------------------
// PATCH /api/v1/settings/password
// -----------------------------------------------------------------------------

export const changePassword =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const userId = getUserId(req);

      if (!userId) {
        return respondUnauthorized(res);
      }

      const body =
        (req.body ?? {}) as Record<
          string,
          unknown
        >;

      const currentPassword =
        asTrimmedString(
          body.current_password,
        );

      const newPassword =
        asTrimmedString(
          body.new_password,
        );

      if (
        !currentPassword ||
        !newPassword
      ) {
        return res.status(400).json({
          success: false,
          error:
            'current_password and new_password are required.',
        });
      }

      if (
        newPassword.length < 8
      ) {
        return res.status(400).json({
          success: false,
          error:
            'new_password must be at least 8 characters.',
        });
      }

      if (
        newPassword.length > 128
      ) {
        return res.status(400).json({
          success: false,
          error:
            'new_password must be 128 characters or fewer.',
        });
      }

      if (
        currentPassword ===
        newPassword
      ) {
        return res.status(400).json({
          success: false,
          error:
            'new_password must be different from the current password.',
        });
      }

      const {
        data,
        error,
      } = await supabaseAdmin
        .from('profiles')
        .select(
          'id, password_hash',
        )
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return respondProfileNotFound(
          res,
        );
      }

      const account =
        data as PasswordRow;

      const matches =
        await bcrypt.compare(
          currentPassword,
          account.password_hash,
        );

      if (!matches) {
        return res.status(400).json({
          success: false,
          error:
            'Current password is incorrect.',
        });
      }

      const newPasswordHash =
        await bcrypt.hash(
          newPassword,
          12,
        );

      const {
        error: updateError,
      } = await supabaseAdmin
        .from('profiles')
        .update({
          password_hash:
            newPasswordHash,
          updated_at:
            new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      return res.status(200).json({
        success: true,
        message:
          'Password changed successfully.',
      });
    } catch (error: unknown) {
      console.error(
        '🔥 [Settings Password Error]:',
        error,
      );

      return res.status(500).json({
        success: false,
        error:
          'Failed to change password.',
      });
    }
  };