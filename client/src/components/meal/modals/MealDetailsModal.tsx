import { useEffect, type MouseEvent } from 'react'
import { Trash2, X } from 'lucide-react'

import type { MealLog } from '../../../services/types/meal'
import {
  formatMacroNumber,
  formatMealTime,
  getFoodName,
  getFoodServing,
  getMealTitle,
} from '../meal.utils'

interface MealDetailsModalProps {
  meal: MealLog | null
  onClose: () => void
  onDelete?: (meal: MealLog) => void
}

export function MealDetailsModal({ meal, onClose, onDelete }: MealDetailsModalProps) {
  useEffect(() => {
    if (!meal) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [meal, onClose])

  if (!meal) return null

  const handleDelete = () => {
    if (!onDelete) return
    onClose()
    onDelete(meal)
  }

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-[#27232B]/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="meal-details-title"
        className="max-h-[88vh] w-full max-w-[650px] overflow-y-auto rounded-[26px] bg-white p-5 shadow-[0_28px_80px_rgba(25,22,30,0.22)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#7482A4]">
              {String(meal.meal_type || 'Meal')}
            </p>
            <h2
              id="meal-details-title"
              className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-[#38323F]"
            >
              {getMealTitle(meal)}
            </h2>
            <p className="mt-1 text-xs text-[#8B8690]">
              Logged {formatMealTime(meal.logged_at)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close meal details"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F5F3F6] text-[#6F6A74] transition hover:bg-[#ECE9EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {meal.raw_input_prompt?.trim() ? (
          <div className="mt-5 rounded-2xl bg-[#F8F7FA] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8B8690]">Original input</p>
            <p className="mt-1 text-sm leading-6 text-[#38323F]">{meal.raw_input_prompt}</p>
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Calories', `${Math.round(Number(meal.total_calories || 0))} kcal`],
            ['Protein', `${formatMacroNumber(Number(meal.total_protein || 0))}g`],
            ['Carbs', `${formatMacroNumber(Number(meal.total_carbs || 0))}g`],
            ['Fat', `${formatMacroNumber(Number(meal.total_fat || 0))}g`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-[#7482A4]/10 p-3">
              <p className="text-[10px] font-semibold text-[#8B8690]">{label}</p>
              <p className="mt-1 text-sm font-extrabold text-[#38323F]">{value}</p>
            </div>
          ))}
        </div>

        {(meal.food_items ?? []).length > 0 ? (
          <div className="mt-5">
            <h3 className="text-sm font-extrabold text-[#38323F]">Food items</h3>
            <div className="mt-3 divide-y divide-[#7482A4]/10 overflow-hidden rounded-2xl border border-[#7482A4]/10">
              {meal.food_items.map((food, index) => (
                <div key={`${getFoodName(food)}-${index}`} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-extrabold text-[#38323F]">{getFoodName(food)}</p>
                      {getFoodServing(food) ? (
                        <p className="mt-0.5 text-[10px] text-[#8B8690]">{getFoodServing(food)}</p>
                      ) : null}
                    </div>
                    <p className="shrink-0 text-xs font-bold text-[#7482A4]">
                      {Math.round(Number(food.calories) || 0)} kcal
                    </p>
                  </div>
                  <p className="mt-2 text-[10px] text-[#8B8690]">
                    {formatMacroNumber(Number(food.protein) || 0)}g protein · {formatMacroNumber(Number(food.carbs) || 0)}g carbs · {formatMacroNumber(Number(food.fat) || 0)}g fat
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {onDelete ? (
          <div className="mt-5 flex justify-end border-t border-[#7482A4]/10 pt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-xl border border-[#B96F78]/20 bg-[#B96F78]/5 px-4 py-2.5 text-xs font-extrabold text-[#B96F78] transition hover:bg-[#B96F78]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B96F78]"
            >
              <Trash2 className="h-4 w-4" />
              Delete Meal
            </button>
          </div>
        ) : null}
      </section>
    </div>
  )
}
