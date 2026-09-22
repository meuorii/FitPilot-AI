import {
  Loader2,
  Target,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react'

import type {
  SettingsGoals,
  SettingsPrimaryGoal,
  SettingsUpdateResponse,
  UpdateGoalSettingsInput,
} from '../../services/types/settings'
import { SettingsNumberField } from './fields/SettingsNumberField'
import { SettingsSelectField } from './fields/SettingsSelectField'
import {
  PRIMARY_GOAL_OPTIONS,
  safeNumberInput,
} from './settings.utils'

interface GoalsNutritionCardProps {
  goals: SettingsGoals
  isSaving: boolean
  onSave: (
    input: UpdateGoalSettingsInput,
  ) => Promise<SettingsUpdateResponse>
}

interface GoalsDraft {
  primaryGoal: string
  targetWeightKg: string
  dailyCalories: string
  proteinGrams: string
  carbsGrams: string
  fatGrams: string
}

const toInputString = (
  value: number | null,
) =>
  value === null
    ? ''
    : String(value)

const toDraft = (
  goals: SettingsGoals,
): GoalsDraft => ({
  primaryGoal:
    goals.primary_goal ?? '',
  targetWeightKg:
    toInputString(
      goals.target_weight_kg,
    ),
  dailyCalories:
    toInputString(
      goals.daily_calories,
    ),
  proteinGrams:
    toInputString(
      goals.protein_grams,
    ),
  carbsGrams:
    toInputString(
      goals.carbs_grams,
    ),
  fatGrams: toInputString(
    goals.fat_grams,
  ),
})

export function GoalsNutritionCard({
  goals,
  isSaving,
  onSave,
}: GoalsNutritionCardProps) {
  const [draft, setDraft] =
    useState<GoalsDraft>(() =>
      toDraft(goals),
    )
  const [error, setError] =
    useState<string | null>(null)

  const serverDraft =
    toDraft(goals)

  const dirty = useMemo(
    () =>
      Object.keys(
        draft,
      ).some(
        (key) =>
          draft[
            key as keyof GoalsDraft
          ] !==
          serverDraft[
            key as keyof GoalsDraft
          ],
      ),
    [draft, serverDraft],
  )

  useEffect(() => {
    if (!dirty) {
      setDraft(toDraft(goals))
    }
  }, [dirty, goals])

  const targetWeight =
    safeNumberInput(
      draft.targetWeightKg,
    )
  const calories =
    safeNumberInput(
      draft.dailyCalories,
    )
  const protein =
    safeNumberInput(
      draft.proteinGrams,
    )
  const carbs =
    safeNumberInput(
      draft.carbsGrams,
    )
  const fat =
    safeNumberInput(
      draft.fatGrams,
    )

  const goalError =
    draft.primaryGoal.trim()
      ? null
      : goals.primary_goal !== null
        ? 'Primary goal cannot be cleared with the current API.'
        : null

  const targetWeightError =
    draft.targetWeightKg.trim() &&
    (targetWeight === null ||
      targetWeight < 25 ||
      targetWeight > 400)
      ? 'Target weight must be between 25 and 400 kg.'
      : null

  const integerError = (
    label: string,
    raw: string,
    value: number | null,
    baseline: number | null,
    min: number,
    max: number,
  ) => {
    if (!raw.trim()) {
      return baseline !== null
        ? `${label} cannot be cleared with the current API.`
        : null
    }

    if (
      value === null ||
      !Number.isInteger(value) ||
      value < min ||
      value > max
    ) {
      return `${label} must be a whole number between ${min} and ${max}.`
    }

    return null
  }

  const caloriesError =
    integerError(
      'Daily calories',
      draft.dailyCalories,
      calories,
      goals.daily_calories,
      500,
      10000,
    )

  const proteinError =
    integerError(
      'Protein',
      draft.proteinGrams,
      protein,
      goals.protein_grams,
      0,
      1000,
    )

  const carbsError =
    integerError(
      'Carbs',
      draft.carbsGrams,
      carbs,
      goals.carbs_grams,
      0,
      1500,
    )

  const fatError =
    integerError(
      'Fat',
      draft.fatGrams,
      fat,
      goals.fat_grams,
      0,
      500,
    )

  const valid =
    !goalError &&
    !targetWeightError &&
    !caloriesError &&
    !proteinError &&
    !carbsError &&
    !fatError

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

    const input: UpdateGoalSettingsInput =
      {}

    if (
      draft.primaryGoal !==
        serverDraft.primaryGoal &&
      draft.primaryGoal
    ) {
      input.primary_goal =
        draft.primaryGoal as SettingsPrimaryGoal
    }

    if (
      draft.targetWeightKg !==
      serverDraft.targetWeightKg
    ) {
      input.target_weight_kg =
        draft.targetWeightKg.trim()
          ? targetWeight
          : null
    }

    if (
      draft.dailyCalories !==
        serverDraft.dailyCalories &&
      calories !== null
    ) {
      input.daily_calories =
        calories
    }

    if (
      draft.proteinGrams !==
        serverDraft.proteinGrams &&
      protein !== null
    ) {
      input.protein_grams =
        protein
    }

    if (
      draft.carbsGrams !==
        serverDraft.carbsGrams &&
      carbs !== null
    ) {
      input.carbs_grams = carbs
    }

    if (
      draft.fatGrams !==
        serverDraft.fatGrams &&
      fat !== null
    ) {
      input.fat_grams = fat
    }

    try {
      const response =
        await onSave(input)

      setDraft(
        toDraft(
          response.data.goals,
        ),
      )
      setError(null)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not save goals and nutrition.',
      )
    }
  }

  return (
    <section
      id="goals-nutrition"
      className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#7482A4]/10 text-[#7482A4]">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
            Goals &amp; Nutrition
          </h2>
          <p className="mt-1 text-xs leading-5 text-[#817C86]">
            Control your target and daily nutrition numbers.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5 space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsSelectField
            id="settings-primary-goal"
            label="Primary Goal"
            value={draft.primaryGoal}
            onChange={(value) => {
              setDraft((current) => ({
                ...current,
                primaryGoal: value,
              }))
              setError(null)
            }}
            options={
              PRIMARY_GOAL_OPTIONS
            }
            placeholder="Not set"
            error={goalError}
            focusTarget
          />

          <SettingsNumberField
            id="settings-target-weight"
            label="Target Weight"
            value={
              draft.targetWeightKg
            }
            onChange={(value) => {
              setDraft((current) => ({
                ...current,
                targetWeightKg:
                  value,
              }))
              setError(null)
            }}
            min={25}
            max={400}
            step={0.1}
            suffix="kg"
            placeholder="Not set"
            error={
              targetWeightError
            }
          />

          <SettingsNumberField
            id="settings-calories"
            label="Daily Calories"
            value={
              draft.dailyCalories
            }
            onChange={(value) => {
              setDraft((current) => ({
                ...current,
                dailyCalories:
                  value,
              }))
              setError(null)
            }}
            min={500}
            max={10000}
            step={1}
            suffix="kcal"
            placeholder="Not set"
            error={caloriesError}
          />

          <SettingsNumberField
            id="settings-protein"
            label="Protein"
            value={
              draft.proteinGrams
            }
            onChange={(value) => {
              setDraft((current) => ({
                ...current,
                proteinGrams: value,
              }))
              setError(null)
            }}
            min={0}
            max={1000}
            step={1}
            suffix="g"
            placeholder="Not set"
            error={proteinError}
          />

          <SettingsNumberField
            id="settings-carbs"
            label="Carbs"
            value={draft.carbsGrams}
            onChange={(value) => {
              setDraft((current) => ({
                ...current,
                carbsGrams: value,
              }))
              setError(null)
            }}
            min={0}
            max={1500}
            step={1}
            suffix="g"
            placeholder="Not set"
            error={carbsError}
          />

          <SettingsNumberField
            id="settings-fat"
            label="Fat"
            value={draft.fatGrams}
            onChange={(value) => {
              setDraft((current) => ({
                ...current,
                fatGrams: value,
              }))
              setError(null)
            }}
            min={0}
            max={500}
            step={1}
            suffix="g"
            placeholder="Not set"
            error={fatError}
          />
        </div>

        <p className="rounded-xl bg-[#7482A4]/[0.06] px-3 py-2.5 text-[10px] leading-4 text-[#817C86]">
          These values are saved directly. Settings does not silently recalculate calories or macros.
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
            : 'Save Goals'}
        </button>
      </form>
    </section>
  )
}
