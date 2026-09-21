import { useEffect, useState, type ChangeEvent, type MouseEvent } from 'react'
import { Loader2, Plus, X } from 'lucide-react'

import { useLogMeal } from '../../../hooks/useMeal'
import type { MealType } from '../../../services/types/meal'
import { useToastStore } from '../../../stores/toastStore'
import { getDefaultMealType } from '../meal.utils'
import { MealTypeSelector } from '../MealTypeSelector'

interface ManualMealModalProps {
  open: boolean
  onClose: () => void
}

interface FormState {
  description: string
  serving: string
  calories: string
  protein: string
  carbs: string
  fat: string
}

const initialForm: FormState = {
  description: '',
  serving: '',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
}

const parseNonNegative = (value: string) => {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

export function ManualMealModal({ open, onClose }: ManualMealModalProps) {
  const [mealType, setMealType] = useState<MealType>(getDefaultMealType())
  const [form, setForm] = useState<FormState>(initialForm)
  const [error, setError] = useState<string | null>(null)
  const mutation = useLogMeal()
  const showToast = useToastStore((state) => state.showToast)

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !mutation.isPending) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, mutation.isPending, onClose])

  if (!open) return null

  const updateField = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    setError(null)
  }

  const handleSubmit = async () => {
    const description = form.description.trim()
    if (!description) {
      setError('Please enter a meal or food description.')
      return
    }

    const values = {
      calories: parseNonNegative(form.calories),
      protein: parseNonNegative(form.protein),
      carbs: parseNonNegative(form.carbs),
      fat: parseNonNegative(form.fat),
    }

    if (Object.values(values).some((value) => value === null)) {
      setError('Nutrition values must be valid non-negative numbers.')
      return
    }

    try {
      const response = await mutation.mutateAsync({
        meal_type: mealType,
        raw_input_prompt: description,
        food_items: [
          {
            name: description,
            serving_size: form.serving.trim() || undefined,
            calories: values.calories ?? 0,
            protein: values.protein ?? 0,
            carbs: values.carbs ?? 0,
            fat: values.fat ?? 0,
          },
        ],
        total_calories: values.calories ?? 0,
        total_protein: values.protein ?? 0,
        total_carbs: values.carbs ?? 0,
        total_fat: values.fat ?? 0,
      })

      showToast({
        type: 'success',
        heading: 'Meal logged',
        subheading: response.message || 'Your manual meal was added successfully.',
      })

      setForm(initialForm)
      setMealType(getDefaultMealType())
      setError(null)
      onClose()
    } catch (submitError) {
      showToast({
        type: 'error',
        heading: 'Could not log meal',
        subheading:
          submitError instanceof Error
            ? submitError.message
            : 'Please review your meal and try again.',
      })
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-[#27232B]/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget && !mutation.isPending) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-meal-title"
        className="max-h-[88vh] w-full max-w-[620px] overflow-y-auto rounded-[26px] bg-white shadow-[0_28px_80px_rgba(25,22,30,0.22)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#7482A4]/10 px-5 py-5 sm:px-6">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#7482A4]">
              Manual meal
            </p>
            <h2
              id="manual-meal-title"
              className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-[#38323F]"
            >
              Log a meal manually
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            aria-label="Close manual meal"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F5F3F6] text-[#6F6A74] transition hover:bg-[#ECE9EF] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6">
          <MealTypeSelector
            value={mealType}
            onChange={setMealType}
            disabled={mutation.isPending}
          />

          <label className="block">
            <span className="text-xs font-extrabold text-[#38323F]">
              Meal or food description *
            </span>
            <input
              value={form.description}
              onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('description', event.target.value)}
              placeholder="e.g. Chicken adobo with rice"
              className="mt-2 h-11 w-full rounded-xl border border-[#7482A4]/15 px-3.5 text-sm text-[#38323F] outline-none focus:border-[#7482A4] focus:ring-2 focus:ring-[#7482A4]/15"
            />
          </label>

          <label className="block">
            <span className="text-xs font-extrabold text-[#38323F]">
              Serving / quantity
            </span>
            <input
              value={form.serving}
              onChange={(event: ChangeEvent<HTMLInputElement>) => updateField('serving', event.target.value)}
              placeholder="e.g. 1 plate or 250g"
              className="mt-2 h-11 w-full rounded-xl border border-[#7482A4]/15 px-3.5 text-sm text-[#38323F] outline-none focus:border-[#7482A4] focus:ring-2 focus:ring-[#7482A4]/15"
            />
          </label>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['calories', 'Calories', 'kcal'],
              ['protein', 'Protein', 'g'],
              ['carbs', 'Carbs', 'g'],
              ['fat', 'Fat', 'g'],
            ].map(([key, label, unit]) => (
              <label key={key} className="block">
                <span className="text-[11px] font-extrabold text-[#38323F]">
                  {label}
                </span>
                <div className="relative mt-2">
                  <input
                    type="number"
                    min="0"
                    step={key === 'calories' ? '1' : '0.1'}
                    value={form[key as keyof FormState]}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      updateField(key as keyof FormState, event.target.value)
                    }
                    placeholder="0"
                    className="h-11 w-full rounded-xl border border-[#7482A4]/15 px-3 pr-9 text-sm text-[#38323F] outline-none focus:border-[#7482A4] focus:ring-2 focus:ring-[#7482A4]/15"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#9A949E]">
                    {unit}
                  </span>
                </div>
              </label>
            ))}
          </div>

          {error ? (
            <p role="alert" className="text-xs font-semibold text-[#B96F78]">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#7482A4]/10 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="rounded-xl border border-[#7482A4]/15 px-4 py-2.5 text-xs font-extrabold text-[#5F5A64] transition hover:bg-[#F5F3F6] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-[#7482A4] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#657493] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Log Meal
          </button>
        </div>
      </section>
    </div>
  )
}
