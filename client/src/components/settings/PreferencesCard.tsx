import {
  Loader2,
  SlidersHorizontal,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react'

import type {
  SettingsActivityLevel,
  SettingsFitnessExperience,
  SettingsProfile,
  SettingsUnitSystem,
  SettingsUpdateResponse,
  SettingsWorkout,
  UpdatePreferenceSettingsInput,
} from '../../services/types/settings'
import { SettingsNumberField } from './fields/SettingsNumberField'
import { SettingsSelectField } from './fields/SettingsSelectField'
import {
  ACTIVITY_LEVEL_OPTIONS,
  FITNESS_EXPERIENCE_OPTIONS,
  UNIT_SYSTEM_OPTIONS,
  safeNumberInput,
} from './settings.utils'

interface PreferencesCardProps {
  profile: SettingsProfile
  workout: SettingsWorkout
  isSaving: boolean
  onSave: (
    input: UpdatePreferenceSettingsInput,
  ) => Promise<SettingsUpdateResponse>
}

interface PreferencesDraft {
  activityLevel: string
  fitnessExperience: string
  unitSystem: string
  workoutDays: string
}

const toDraft = (
  profile: SettingsProfile,
  workout: SettingsWorkout,
): PreferencesDraft => ({
  activityLevel:
    profile.activity_level ?? '',
  fitnessExperience:
    profile.fitness_experience ??
    '',
  unitSystem:
    profile.unit_system ?? '',
  workoutDays:
    workout.workout_days_per_week ===
    null
      ? ''
      : String(
          workout.workout_days_per_week,
        ),
})

export function PreferencesCard({
  profile,
  workout,
  isSaving,
  onSave,
}: PreferencesCardProps) {
  const [draft, setDraft] =
    useState<PreferencesDraft>(() =>
      toDraft(profile, workout),
    )
  const [error, setError] =
    useState<string | null>(null)

  const serverDraft = toDraft(
    profile,
    workout,
  )

  const dirty = useMemo(
    () =>
      Object.keys(
        draft,
      ).some(
        (key) =>
          draft[
            key as keyof PreferencesDraft
          ] !==
          serverDraft[
            key as keyof PreferencesDraft
          ],
      ),
    [draft, serverDraft],
  )

  useEffect(() => {
    if (!dirty) {
      setDraft(
        toDraft(
          profile,
          workout,
        ),
      )
    }
  }, [dirty, profile, workout])

  const workoutDays =
    safeNumberInput(
      draft.workoutDays,
    )

  const activityError =
    !draft.activityLevel &&
    profile.activity_level !== null
      ? 'Activity level cannot be cleared with the current API.'
      : null

  const experienceError =
    !draft.fitnessExperience &&
    profile.fitness_experience !==
      null
      ? 'Fitness experience cannot be cleared with the current API.'
      : null

  const unitError =
    !draft.unitSystem &&
    profile.unit_system !== null
      ? 'Unit system cannot be cleared with the current API.'
      : null

  const workoutDaysError =
    draft.workoutDays.trim() &&
    (workoutDays === null ||
      !Number.isInteger(
        workoutDays,
      ) ||
      workoutDays < 0 ||
      workoutDays > 7)
      ? 'Workout days must be a whole number between 0 and 7.'
      : !draft.workoutDays.trim() &&
          workout.workout_days_per_week !==
            null
        ? 'Workout days cannot be cleared with the current API.'
        : null

  const valid =
    !activityError &&
    !experienceError &&
    !unitError &&
    !workoutDaysError

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (
      isSaving ||
      !dirty ||
      !valid
    ) {
      return
    }

    const input: UpdatePreferenceSettingsInput =
      {}

    if (
      draft.activityLevel !==
        serverDraft.activityLevel &&
      draft.activityLevel
    ) {
      input.activity_level =
        draft.activityLevel as SettingsActivityLevel
    }

    if (
      draft.fitnessExperience !==
        serverDraft.fitnessExperience &&
      draft.fitnessExperience
    ) {
      input.fitness_experience =
        draft.fitnessExperience as SettingsFitnessExperience
    }

    if (
      draft.unitSystem !==
        serverDraft.unitSystem &&
      draft.unitSystem
    ) {
      input.unit_system =
        draft.unitSystem as SettingsUnitSystem
    }

    if (
      draft.workoutDays !==
        serverDraft.workoutDays &&
      workoutDays !== null
    ) {
      input.workout_days_per_week =
        workoutDays
    }

    try {
      const response =
        await onSave(input)

      setDraft(
        toDraft(
          response.data.profile,
          response.data.workout,
        ),
      )
      setError(null)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not save preferences.',
      )
    }
  }

  return (
    <section
      id="preferences"
      className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#7482A4]/10 text-[#7482A4]">
          <SlidersHorizontal className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
            Preferences
          </h2>
          <p className="mt-1 text-xs leading-5 text-[#817C86]">
            Tune activity, experience, units, and weekly training frequency.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5 space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsSelectField
            id="settings-activity-level"
            label="Activity Level"
            value={
              draft.activityLevel
            }
            onChange={(value) => {
              setDraft((current) => ({
                ...current,
                activityLevel: value,
              }))
              setError(null)
            }}
            options={
              ACTIVITY_LEVEL_OPTIONS
            }
            placeholder="Not set"
            error={activityError}
            focusTarget
          />

          <SettingsSelectField
            id="settings-fitness-experience"
            label="Fitness Experience"
            value={
              draft.fitnessExperience
            }
            onChange={(value) => {
              setDraft((current) => ({
                ...current,
                fitnessExperience:
                  value,
              }))
              setError(null)
            }}
            options={
              FITNESS_EXPERIENCE_OPTIONS
            }
            placeholder="Not set"
            error={experienceError}
          />

          <SettingsSelectField
            id="settings-unit-system"
            label="Unit System"
            value={draft.unitSystem}
            onChange={(value) => {
              setDraft((current) => ({
                ...current,
                unitSystem: value,
              }))
              setError(null)
            }}
            options={
              UNIT_SYSTEM_OPTIONS
            }
            placeholder="Not set"
            error={unitError}
          />

          <SettingsNumberField
            id="settings-workout-days"
            label="Workout Days Per Week"
            value={draft.workoutDays}
            onChange={(value) => {
              setDraft((current) => ({
                ...current,
                workoutDays: value,
              }))
              setError(null)
            }}
            min={0}
            max={7}
            step={1}
            suffix="days"
            placeholder="Not set"
            error={workoutDaysError}
          />
        </div>

        <p className="rounded-xl bg-[#7482A4]/[0.06] px-3 py-2.5 text-[10px] leading-4 text-[#817C86]">
          Unit system is stored as a preference. The current profile API still sends height and weight using metric field names.
        </p>

        {error ? (
          <p
            role="alert"
            className="text-xs font-semibold leading-5 text-[#B96F78]"
          >
            {error}
          </p>
        ) : dirty ? (
          <p className="text-[11px] font-semibold text-[#7482A4]">
            Unsaved changes
          </p>
        ) : null}

        <button
          type="submit"
          disabled={
            !dirty ||
            !valid ||
            isSaving
          }
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#7482A4] px-4 text-sm font-extrabold text-white transition hover:bg-[#657493] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          {isSaving
            ? 'Saving...'
            : 'Save Preferences'}
        </button>
      </form>
    </section>
  )
}
