import type {
  SettingsActivityLevel,
  SettingsFitnessExperience,
  SettingsPrimaryGoal,
  SettingsUnitSystem,
} from '../../services/types/settings'

export type SettingsSectionId =
  | 'account-information'
  | 'profile-information'
  | 'goals-nutrition'
  | 'preferences'
  | 'security'

export const SETTINGS_SECTION_IDS = {
  account: 'account-information',
  profile: 'profile-information',
  goals: 'goals-nutrition',
  preferences: 'preferences',
  security: 'security',
} as const satisfies Record<string, SettingsSectionId>

const titleCase = (value: string) =>
  value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

export const formatGoalLabel = (
  value: string | null | undefined,
) => (value?.trim() ? titleCase(value) : 'Not set')

export const formatActivityLevel = (
  value: string | null | undefined,
) => (value?.trim() ? titleCase(value) : 'Not set')

export const formatFitnessExperience = (
  value: string | null | undefined,
) => (value?.trim() ? titleCase(value) : 'Not set')

export const formatUnitSystem = (
  value: string | null | undefined,
) => {
  if (value === 'metric') return 'Metric'
  if (value === 'imperial') return 'Imperial'
  return value?.trim() ? titleCase(value) : 'Not set'
}

export const formatUpdatedAt = (
  value: string | null | undefined,
) => {
  if (!value) return 'Not available'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export const formatWeight = (
  value: number | null | undefined,
) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'Not set'
  }

  return `${new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
  }).format(value)} kg`
}

export const formatCalories = (
  value: number | null | undefined,
) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'Not set'
  }

  return `${new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value)} kcal`
}

export const formatGrams = (
  value: number | null | undefined,
) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'Not set'
  }

  return `${new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value)} g`
}

export const safeNumberInput = (
  value: string,
): number | null => {
  if (!value.trim()) return null

  const parsed = Number(value)

  return Number.isFinite(parsed)
    ? parsed
    : null
}

export const normalizeOptionalUrl = (
  value: string,
): string | null => {
  const trimmed = value.trim()
  return trimmed || null
}

export const isValidHttpUrl = (
  value: string,
): boolean => {
  try {
    const url = new URL(value)
    return (
      url.protocol === 'http:' ||
      url.protocol === 'https:'
    )
  } catch {
    return false
  }
}

export const getInitials = (
  fullName: string | null | undefined,
) => {
  if (!fullName?.trim()) return 'FP'

  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export interface PasswordAssessment {
  isValid: boolean
  level: 'weak' | 'medium' | 'strong' | null
  score: number
}

export const assessPassword = (
  password: string,
): PasswordAssessment => {
  const checks = [
    password.length >= 8,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]

  const score = checks.filter(Boolean).length
  const isValid = checks.every(Boolean)

  let level: PasswordAssessment['level'] = null

  if (password) {
    if (isValid) {
      level = 'strong'
    } else if (checks[0] && score >= 3) {
      level = 'medium'
    } else {
      level = 'weak'
    }
  }

  return {
    isValid,
    level,
    score,
  }
}

const SEARCH_SECTIONS: Array<{
  id: SettingsSectionId
  keywords: string[]
}> = [
  {
    id: SETTINGS_SECTION_IDS.account,
    keywords: [
      'account',
      'name',
      'full name',
      'email',
      'avatar',
      'profile picture',
    ],
  },
  {
    id: SETTINGS_SECTION_IDS.profile,
    keywords: [
      'profile',
      'age',
      'gender',
      'height',
      'weight',
      'current weight',
    ],
  },
  {
    id: SETTINGS_SECTION_IDS.goals,
    keywords: [
      'goal',
      'goals',
      'nutrition',
      'calorie',
      'calories',
      'protein',
      'carb',
      'carbs',
      'fat',
      'macro',
      'macros',
      'target weight',
    ],
  },
  {
    id: SETTINGS_SECTION_IDS.preferences,
    keywords: [
      'preference',
      'preferences',
      'activity',
      'experience',
      'unit',
      'units',
      'metric',
      'imperial',
      'workout day',
      'workout days',
    ],
  },
  {
    id: SETTINGS_SECTION_IDS.security,
    keywords: [
      'password',
      'security',
      'change password',
    ],
  },
]

export const findSettingsSection = (
  search: string,
): SettingsSectionId | null => {
  const query = search.trim().toLocaleLowerCase()

  if (!query) return null

  const exact = SEARCH_SECTIONS.find(({ keywords }) =>
    keywords.some((keyword) => query === keyword),
  )

  if (exact) return exact.id

  const partial = SEARCH_SECTIONS.find(({ keywords }) =>
    keywords.some(
      (keyword) =>
        keyword.includes(query) ||
        query.includes(keyword),
    ),
  )

  return partial?.id ?? null
}

export const ACTIVITY_LEVEL_OPTIONS: Array<{
  value: SettingsActivityLevel
  label: string
}> = [
  {
    value: 'sedentary',
    label: 'Sedentary',
  },
  {
    value: 'lightly_active',
    label: 'Lightly Active',
  },
  {
    value: 'moderately_active',
    label: 'Moderately Active',
  },
  {
    value: 'very_active',
    label: 'Very Active',
  },
]

export const FITNESS_EXPERIENCE_OPTIONS: Array<{
  value: SettingsFitnessExperience
  label: string
}> = [
  {
    value: 'beginner',
    label: 'Beginner',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
  },
  {
    value: 'advanced',
    label: 'Advanced',
  },
]

export const UNIT_SYSTEM_OPTIONS: Array<{
  value: SettingsUnitSystem
  label: string
}> = [
  {
    value: 'metric',
    label: 'Metric (kg, cm)',
  },
  {
    value: 'imperial',
    label: 'Imperial (lb, in)',
  },
]

export const PRIMARY_GOAL_OPTIONS: Array<{
  value: SettingsPrimaryGoal
  label: string
}> = [
  {
    value: 'lose_weight',
    label: 'Lose Weight',
  },
  {
    value: 'lose_fat',
    label: 'Lose Fat',
  },
  {
    value: 'maintain',
    label: 'Maintain',
  },
  {
    value: 'maintain_weight',
    label: 'Maintain Weight',
  },
  {
    value: 'gain_muscle',
    label: 'Gain Muscle',
  },
]
