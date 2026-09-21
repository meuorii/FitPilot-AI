import { Utensils } from 'lucide-react'

import type { ParsedMealData } from '../../services/types/meal'
import {
  formatMacroNumber,
  getFoodImageUrl,
  getFoodName,
  getFoodServing,
  normalizeParsedMeal,
} from './meal.utils'
import { MealImage } from './MealImage'

interface ParsedMealPreviewProps {
  parsed: ParsedMealData | null
}

export function ParsedMealPreview({ parsed }: ParsedMealPreviewProps) {
  if (!parsed) {
    return (
      <div className="grid min-h-[200px] place-items-center rounded-2xl border border-dashed border-[#7482A4]/20 bg-[#FAF9FB] p-6 text-center">
        <div>
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-[#7482A4]/10 text-[#7482A4]">
            <Utensils className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-extrabold text-[#38323F]">
            Parsed meal preview
          </p>
          <p className="mt-1 max-w-xs text-xs leading-5 text-[#8B8690]">
            Describe a meal, then FitPilot will show the estimated food items and nutrition here.
          </p>
        </div>
      </div>
    )
  }

  const meal = normalizeParsedMeal(parsed)

  return (
    <div className="min-h-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-extrabold text-[#38323F]">
          Parsed Meal Preview
        </h3>
        <span className="text-[11px] font-bold text-[#7482A4]">
          AI estimate
        </span>
      </div>

      {meal.foods.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-[#7482A4]/12">
          <div className="hidden grid-cols-[minmax(0,1fr)_60px_60px_60px_50px] gap-2 bg-[#FAF9FB] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.05em] text-[#8B8690] sm:grid">
            <span>Food</span>
            <span>Calories</span>
            <span>Protein</span>
            <span>Carbs</span>
            <span>Fat</span>
          </div>

          <div className="divide-y divide-[#7482A4]/10">
            {meal.foods.map((food, index) => (
              <div
                key={`${getFoodName(food)}-${index}`}
                className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-3 px-3 py-2.5 sm:grid-cols-[44px_minmax(0,1fr)_60px_60px_60px_50px]"
              >
                <MealImage
                  src={getFoodImageUrl(food)}
                  alt=""
                  className="h-10 w-10 rounded-xl"
                />

                <div className="min-w-0">
                  <p className="truncate text-xs font-extrabold text-[#38323F]">
                    {getFoodName(food)}
                  </p>
                  {getFoodServing(food) ? (
                    <p className="mt-0.5 truncate text-[10px] text-[#8B8690]">
                      {getFoodServing(food)}
                    </p>
                  ) : null}
                  <p className="mt-1 text-[10px] text-[#8B8690] sm:hidden">
                    {Math.round(Number(food.calories) || 0)} kcal ·{' '}
                    {formatMacroNumber(Number(food.protein) || 0)}g P ·{' '}
                    {formatMacroNumber(Number(food.carbs) || 0)}g C ·{' '}
                    {formatMacroNumber(Number(food.fat) || 0)}g F
                  </p>
                </div>

                <span className="hidden text-xs font-bold text-[#38323F] sm:block">
                  {Math.round(Number(food.calories) || 0)}
                </span>
                <span className="hidden text-xs font-semibold text-[#5F5A64] sm:block">
                  {formatMacroNumber(Number(food.protein) || 0)}g
                </span>
                <span className="hidden text-xs font-semibold text-[#5F5A64] sm:block">
                  {formatMacroNumber(Number(food.carbs) || 0)}g
                </span>
                <span className="hidden text-xs font-semibold text-[#5F5A64] sm:block">
                  {formatMacroNumber(Number(food.fat) || 0)}g
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#7482A4]/20 bg-[#FAF9FB] px-4 py-6 text-center text-xs text-[#8B8690]">
          The parser returned nutrition totals but no individual food items.
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ['Calories', `${Math.round(meal.total_calories)} kcal`],
          ['Protein', `${formatMacroNumber(meal.total_protein)}g`],
          ['Carbs', `${formatMacroNumber(meal.total_carbs)}g`],
          ['Fat', `${formatMacroNumber(meal.total_fat)}g`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-[#F5F3F6] px-3 py-2">
            <p className="text-[10px] font-semibold text-[#8B8690]">{label}</p>
            <p className="mt-0.5 text-xs font-extrabold text-[#38323F]">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
