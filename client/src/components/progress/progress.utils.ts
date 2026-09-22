import type {
  BodyFatTrendPoint,
  ProgressGoalSummary,
  ProgressLog,
  WeightTrendPoint,
} from '../../services/types/progress'

const fallback = '—'

const finite = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const parseDateValue = (value: string) => {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value)
  const date = new Date(dateOnly ? `${value}T12:00:00` : value)
  return Number.isNaN(date.getTime()) ? null : date
}

export const formatGoalLabel = (goal?: string | null) => {
  const value = goal?.trim()
  if (!value) return 'Not set'

  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export const formatWeight = (
  value: number | null | undefined,
  empty = fallback,
) => {
  if (!finite(value)) return empty
  return `${new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
  }).format(value)} kg`
}

export const formatSignedWeight = (
  value: number | null | undefined,
  empty = fallback,
) => {
  if (!finite(value)) return empty

  const absolute = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
  }).format(Math.abs(value))

  if (value > 0) return `+${absolute} kg`
  if (value < 0) return `−${absolute} kg`
  return '0 kg'
}

export const formatBodyFat = (
  value: number | null | undefined,
  empty = fallback,
) => {
  if (!finite(value)) return empty
  return `${new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
  }).format(value)}%`
}

export const formatVolume = (
  value: number | null | undefined,
  empty = fallback,
) => {
  if (!finite(value)) return empty

  return `${new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value)} kg`
}

export const formatDate = (
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  },
) => {
  if (!value) return fallback

  const date = parseDateValue(value)
  if (!date) return fallback

  return new Intl.DateTimeFormat(undefined, options).format(date)
}

export const formatShortDate = (value: string) =>
  formatDate(value, {
    month: 'short',
    day: 'numeric',
  })

export const formatWeekRange = (
  start: string | null | undefined,
  end: string | null | undefined,
) => {
  if (!start || !end) return 'Current week'

  const formattedStart = formatDate(start, {
    month: 'short',
    day: 'numeric',
  })
  const formattedEnd = formatDate(end, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  if (formattedStart === fallback || formattedEnd === fallback) {
    return 'Current week'
  }

  return `${formattedStart} – ${formattedEnd}`
}

export const safePercentage = (
  numerator: number | null | undefined,
  denominator?: number | null,
) => {
  if (denominator === undefined) {
    if (!finite(numerator)) return null
    return Math.min(100, Math.max(0, numerator))
  }

  if (!finite(numerator) || !finite(denominator) || denominator <= 0) {
    return null
  }

  return Math.min(100, Math.max(0, (numerator / denominator) * 100))
}

export const formatPercentage = (
  value: number | null | undefined,
  empty = fallback,
) => {
  if (!finite(value)) return empty

  return `${new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
  }).format(value)}%`
}

export const isValidHttpUrl = (value: string) => {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export const searchProgressLogs = (
  logs: ProgressLog[],
  search: string,
) => {
  const query = search.trim().toLocaleLowerCase()
  if (!query) return [...logs]

  return logs.filter((log) => {
    const values = [
      formatDate(log.logged_at),
      log.photo_tag ?? '',
      finite(log.weight_kg) ? `${log.weight_kg} kg` : '',
      finite(log.body_fat_percentage)
        ? `${log.body_fat_percentage}%`
        : '',
    ]

    return values.some((value) =>
      value.toLocaleLowerCase().includes(query),
    )
  })
}

export const sortWeightTrend = (points: WeightTrendPoint[]) =>
  [...points]
    .filter(
      (
        point,
      ): point is WeightTrendPoint & { weight_kg: number } =>
        finite(point.weight_kg),
    )
    .sort(
      (a, b) =>
        new Date(a.logged_at).getTime() -
        new Date(b.logged_at).getTime(),
    )

export const sortBodyFatTrend = (points: BodyFatTrendPoint[]) =>
  [...points]
    .filter(
      (
        point,
      ): point is BodyFatTrendPoint & {
        body_fat_percentage: number
      } => finite(point.body_fat_percentage),
    )
    .sort(
      (a, b) =>
        new Date(a.logged_at).getTime() -
        new Date(b.logged_at).getTime(),
    )

export const hasMeaningfulGoalProgress = (
  goal: ProgressGoalSummary,
) =>
  finite(goal.starting_weight_kg) &&
  finite(goal.current_weight_kg) &&
  finite(goal.target_weight_kg) &&
  finite(goal.progress_percentage)
