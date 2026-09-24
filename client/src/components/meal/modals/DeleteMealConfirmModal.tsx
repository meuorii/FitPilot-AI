import { useEffect, type MouseEvent } from 'react'
import { Loader2, Trash2, X } from 'lucide-react'

import { useDeleteMeal } from '../../../hooks/useMeal'
import type { MealLog } from '../../../services/types/meal'
import { useToastStore } from '../../../stores/toastStore'
import { getMealTitle } from '../meal.utils'

interface DeleteMealConfirmModalProps {
  meal: MealLog | null
  onClose: () => void
}

export function DeleteMealConfirmModal({
  meal,
  onClose,
}: DeleteMealConfirmModalProps) {
  const mutation = useDeleteMeal()
  const showToast = useToastStore((state) => state.showToast)

  useEffect(() => {
    if (!meal) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !mutation.isPending) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [meal, mutation.isPending, onClose])

  if (!meal) return null

  const handleDelete = async () => {
    if (mutation.isPending) return

    try {
      const response = await mutation.mutateAsync(meal.id)
      showToast({
        type: 'success',
        heading: 'Meal deleted',
        subheading: response.message || 'Today’s nutrition totals were updated.',
      })
      onClose()
    } catch (error) {
      showToast({
        type: 'error',
        heading: 'Could not delete meal',
        subheading:
          error instanceof Error
            ? error.message
            : 'Please try deleting the meal again.',
      })
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-[#27232B]/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget && !mutation.isPending) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-meal-title"
        className="w-full max-w-[470px] rounded-[26px] bg-white p-6 shadow-[0_28px_80px_rgba(25,22,30,0.22)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#B96F78]/10 text-[#B96F78]">
            <Trash2 className="h-5 w-5" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            aria-label="Close delete confirmation"
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#F5F3F6] text-[#6F6A74] transition hover:bg-[#ECE9EF] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h2
          id="delete-meal-title"
          className="mt-4 text-xl font-extrabold tracking-[-0.025em] text-[#38323F]"
        >
          Delete this meal?
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#77727B]">
          <span className="font-semibold text-[#38323F]">{getMealTitle(meal)}</span>{' '}
          will be removed from your meal history and nutrition totals.
        </p>

        <div className="mt-6 flex justify-end gap-2">
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
            onClick={handleDelete}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-[#B96F78] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#A95F69] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B96F78]"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete Meal
          </button>
        </div>
      </section>
    </div>
  )
}

