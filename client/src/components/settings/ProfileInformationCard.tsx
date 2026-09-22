import {
  Loader2,
  UserCog,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react'

import type {
  SettingsProfile,
  SettingsUpdateResponse,
  UpdateProfileSettingsInput,
} from '../../services/types/settings'
import { SettingsNumberField } from './fields/SettingsNumberField'
import {
  SettingsSelectField,
  type SettingsSelectOption,
} from './fields/SettingsSelectField'
import { safeNumberInput } from './settings.utils'

interface ProfileInformationCardProps {
  profile: SettingsProfile
  isSaving: boolean
  onSave: (
    input: UpdateProfileSettingsInput,
  ) => Promise<SettingsUpdateResponse>
}

interface ProfileDraft {
  age: string
  gender: string
  heightCm: string
  currentWeightKg: string
}

const toInputString = (
  value: number | null,
) =>
  value === null
    ? ''
    : String(value)

const toDraft = (
  profile: SettingsProfile,
): ProfileDraft => ({
  age: toInputString(profile.age),
  gender: profile.gender ?? '',
  heightCm: toInputString(
    profile.height_cm,
  ),
  currentWeightKg:
    toInputString(
      profile.current_weight_kg,
    ),
})

const baseGenderOptions: SettingsSelectOption[] =
  [
    {
      value: 'male',
      label: 'Male',
    },
    {
      value: 'female',
      label: 'Female',
    },
  ]

export function ProfileInformationCard({
  profile,
  isSaving,
  onSave,
}: ProfileInformationCardProps) {
  const [draft, setDraft] =
    useState<ProfileDraft>(() =>
      toDraft(profile),
    )
  const [error, setError] =
    useState<string | null>(null)

  const serverDraft =
    toDraft(profile)

  const dirty = useMemo(
    () =>
      draft.age !==
        serverDraft.age ||
      draft.gender !==
        serverDraft.gender ||
      draft.heightCm !==
        serverDraft.heightCm ||
      draft.currentWeightKg !==
        serverDraft.currentWeightKg,
    [
      draft,
      serverDraft.age,
      serverDraft.currentWeightKg,
      serverDraft.gender,
      serverDraft.heightCm,
    ],
  )

  useEffect(() => {
    if (!dirty) {
      setDraft(toDraft(profile))
    }
  }, [dirty, profile])

  const age =
    safeNumberInput(draft.age)
  const height =
    safeNumberInput(
      draft.heightCm,
    )
  const weight =
    safeNumberInput(
      draft.currentWeightKg,
    )

  const ageError =
    draft.age.trim() &&
    (age === null ||
      !Number.isInteger(age) ||
      age < 13 ||
      age > 120)
      ? 'Age must be a whole number between 13 and 120.'
      : !draft.age.trim() &&
          profile.age !== null
        ? 'Age cannot be cleared with the current API.'
        : null

  const genderError =
    draft.gender.trim()
      ? null
      : profile.gender !== null
        ? 'Gender cannot be cleared with the current API.'
        : null

  const heightError =
    draft.heightCm.trim() &&
    (height === null ||
      height < 80 ||
      height > 260)
      ? 'Height must be between 80 and 260 cm.'
      : !draft.heightCm.trim() &&
          profile.height_cm !==
            null
        ? 'Height cannot be cleared with the current API.'
        : null

  const weightError =
    draft.currentWeightKg.trim() &&
    (weight === null ||
      weight < 25 ||
      weight > 400)
      ? 'Weight must be between 25 and 400 kg.'
      : !draft.currentWeightKg.trim() &&
          profile.current_weight_kg !==
            null
        ? 'Weight cannot be cleared with the current API.'
        : null

  const genderOptions =
    useMemo(() => {
      if (
        profile.gender &&
        !baseGenderOptions.some(
          (option) =>
            option.value ===
            profile.gender,
        )
      ) {
        return [
          ...baseGenderOptions,
          {
            value: profile.gender,
            label: profile.gender,
          },
        ]
      }

      return baseGenderOptions
    }, [profile.gender])

  const valid =
    !ageError &&
    !genderError &&
    !heightError &&
    !weightError

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

    const input: UpdateProfileSettingsInput =
      {}

    if (
      draft.age !==
        serverDraft.age &&
      age !== null
    ) {
      input.age = age
    }

    if (
      draft.gender !==
        serverDraft.gender &&
      draft.gender.trim()
    ) {
      input.gender =
        draft.gender.trim()
    }

    if (
      draft.heightCm !==
        serverDraft.heightCm &&
      height !== null
    ) {
      input.height_cm = height
    }

    if (
      draft.currentWeightKg !==
        serverDraft.currentWeightKg &&
      weight !== null
    ) {
      input.current_weight_kg =
        weight
    }

    try {
      const response =
        await onSave(input)

      setDraft(
        toDraft(
          response.data.profile,
        ),
      )
      setError(null)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not save profile information.',
      )
    }
  }

  return (
    <section
      id="profile-information"
      className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#7482A4]/10 text-[#7482A4]">
          <UserCog className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
            Profile Information
          </h2>
          <p className="mt-1 text-xs leading-5 text-[#817C86]">
            Keep your body profile accurate for better guidance.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5 space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsNumberField
            id="settings-age"
            label="Age"
            value={draft.age}
            onChange={(value) => {
              setDraft((current) => ({
                ...current,
                age: value,
              }))
              setError(null)
            }}
            min={13}
            max={120}
            step={1}
            placeholder="Not set"
            error={ageError}
            focusTarget
          />

          <SettingsSelectField
            id="settings-gender"
            label="Gender"
            value={draft.gender}
            onChange={(value) => {
              setDraft((current) => ({
                ...current,
                gender: value,
              }))
              setError(null)
            }}
            options={genderOptions}
            placeholder="Not set"
            error={genderError}
          />

          <SettingsNumberField
            id="settings-height"
            label="Height"
            value={draft.heightCm}
            onChange={(value) => {
              setDraft((current) => ({
                ...current,
                heightCm: value,
              }))
              setError(null)
            }}
            min={80}
            max={260}
            step={0.1}
            suffix="cm"
            placeholder="Not set"
            error={heightError}
          />

          <SettingsNumberField
            id="settings-current-weight"
            label="Current Weight"
            value={
              draft.currentWeightKg
            }
            onChange={(value) => {
              setDraft((current) => ({
                ...current,
                currentWeightKg:
                  value,
              }))
              setError(null)
            }}
            min={25}
            max={400}
            step={0.1}
            suffix="kg"
            placeholder="Not set"
            error={weightError}
            help="Changing your current weight also adds a Progress check-in."
          />
        </div>

        <p className="rounded-xl bg-[#7482A4]/[0.06] px-3 py-2.5 text-[10px] leading-4 text-[#817C86]">
          The current API stores body measurements in metric fields (`height_cm` and `current_weight_kg`), even when your unit preference is Imperial.
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
            : 'Save Profile'}
        </button>
      </form>
    </section>
  )
}
