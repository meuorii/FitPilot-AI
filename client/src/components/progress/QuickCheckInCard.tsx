import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import {
  Camera,
  Loader2,
  Save,
  Scale,
} from 'lucide-react'

import type { CreateProgressLogInput } from '../../services/types/progress'
import { isValidHttpUrl } from './progress.utils'

interface QuickCheckInCardProps {
  isSubmitting: boolean
  onSubmit: (input: CreateProgressLogInput) => Promise<void>
}

interface FormState {
  weight: string
  bodyFat: string
  photoUrl: string
  photoTag: string
}

const initialForm: FormState = {
  weight: '',
  bodyFat: '',
  photoUrl: '',
  photoTag: '',
}

export function QuickCheckInCard({
  isSubmitting,
  onSubmit,
}: QuickCheckInCardProps) {
  const [form, setForm] = useState<FormState>(initialForm)
  const [error, setError] = useState<string | null>(null)

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
    setError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) return

    const weightText = form.weight.trim()
    const bodyFatText = form.bodyFat.trim()
    const photoUrl = form.photoUrl.trim()
    const photoTag = form.photoTag.trim()

    if (!weightText && !bodyFatText && !photoUrl) {
      setError(
        'Add a weight, body-fat value, or photo URL before saving.',
      )
      return
    }

    const payload: CreateProgressLogInput = {}

    if (weightText) {
      const weight = Number(weightText)

      if (!Number.isFinite(weight) || weight <= 0) {
        setError('Weight must be a valid number greater than 0.')
        return
      }

      payload.weight_kg = weight
    }

    if (bodyFatText) {
      const bodyFat = Number(bodyFatText)

      if (
        !Number.isFinite(bodyFat) ||
        bodyFat < 0 ||
        bodyFat > 100
      ) {
        setError('Body fat must be between 0 and 100.')
        return
      }

      payload.body_fat_percentage = bodyFat
    }

    if (photoUrl) {
      if (!isValidHttpUrl(photoUrl)) {
        setError('Photo URL must be a valid http or https URL.')
        return
      }

      payload.photo_url = photoUrl

      if (photoTag) {
        payload.photo_tag = photoTag
      }
    }

    try {
      await onSubmit(payload)
      setForm(initialForm)
      setError(null)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not save your check-in. Please try again.',
      )
    }
  }

  return (
    <section
      id="quick-check-in"
      className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#7482A4]/10 text-[#7482A4]">
          <Scale className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
            Quick Check-In
          </h2>
          <p className="mt-1 text-xs leading-5 text-[#817C86]">
            Log your latest stats to track your progress.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-[#5F5A64]">
              Weight (kg)
            </span>
            <input
              type="number"
              min="0"
              step="0.1"
              inputMode="decimal"
              value={form.weight}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                update('weight', event.target.value)
              }
              placeholder="e.g. 79.6"
              className="h-11 w-full rounded-xl border border-[#7482A4]/15 bg-[#FCFBFD] px-3.5 text-sm text-[#38323F] outline-none transition placeholder:text-[#AAA5AE] focus:border-[#7482A4] focus:ring-2 focus:ring-[#7482A4]/12"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-[#5F5A64]">
              Body Fat (%)
            </span>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              inputMode="decimal"
              value={form.bodyFat}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                update('bodyFat', event.target.value)
              }
              placeholder="Optional"
              className="h-11 w-full rounded-xl border border-[#7482A4]/15 bg-[#FCFBFD] px-3.5 text-sm text-[#38323F] outline-none transition placeholder:text-[#AAA5AE] focus:border-[#7482A4] focus:ring-2 focus:ring-[#7482A4]/12"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[#5F5A64]">
            <Camera className="h-3.5 w-3.5 text-[#7482A4]" />
            Photo URL
            <span className="font-medium text-[#9C98A1]">(optional)</span>
          </span>
          <input
            type="url"
            value={form.photoUrl}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              update('photoUrl', event.target.value)
            }
            placeholder="https://..."
            className="h-11 w-full rounded-xl border border-[#7482A4]/15 bg-[#FCFBFD] px-3.5 text-sm text-[#38323F] outline-none transition placeholder:text-[#AAA5AE] focus:border-[#7482A4] focus:ring-2 focus:ring-[#7482A4]/12"
          />
        </label>

        {form.photoUrl.trim() ? (
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-[#5F5A64]">
              Photo Tag
              <span className="ml-1 font-medium text-[#9C98A1]">
                (optional)
              </span>
            </span>
            <input
              type="text"
              value={form.photoTag}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                update('photoTag', event.target.value)
              }
              placeholder="Front, side, back..."
              className="h-11 w-full rounded-xl border border-[#7482A4]/15 bg-[#FCFBFD] px-3.5 text-sm text-[#38323F] outline-none transition placeholder:text-[#AAA5AE] focus:border-[#7482A4] focus:ring-2 focus:ring-[#7482A4]/12"
            />
          </label>
        ) : null}

        {error ? (
          <p role="alert" className="text-xs font-semibold leading-5 text-[#B96F78]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#7482A4] px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#657493] disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSubmitting ? 'Saving...' : 'Save Check-In'}
        </button>
      </form>
    </section>
  )
}
