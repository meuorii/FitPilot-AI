import { useMemo, useState, type ChangeEvent, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent, type RefObject } from 'react'
import { ChevronRight, Trash2 } from 'lucide-react'

import type { MealLog } from '../../services/types/meal'
import {
  formatMacroNumber,
  formatMealTime,
  getMealImageUrl,
  getMealSearchText,
  getMealSecondaryText,
  getMealTitle,
} from './meal.utils'
import { MealEmptyState } from './MealEmptyState'
import { MealImage } from './MealImage'

export type MealSort =
  | 'newest'
  | 'oldest'
  | 'highest-calories'
  | 'lowest-calories'

interface TodayMealsListProps {
  meals: MealLog[]
  search: string
  sectionRef: RefObject<HTMLElement | null>
  dateLabel?: string
  isToday?: boolean
  onSelectMeal: (meal: MealLog) => void
  onDeleteMeal: (meal: MealLog) => void
  onParseAI: () => void
  onLogManual: () => void
}

const mealTypeStyles: Record<string, string> = {
  breakfast: 'bg-[#7482A4]/12 text-[#5F6E91]',
  lunch: 'bg-[#6F9B83]/12 text-[#5E836F]',
  dinner: 'bg-[#7A719B]/12 text-[#6B628B]',
  snack: 'bg-[#C6A45D]/15 text-[#9A7B3E]',
}

export function TodayMealsList({
  meals,
  search,
  sectionRef,
  dateLabel = 'Today',
  isToday = true,
  onSelectMeal,
  onDeleteMeal,
  onParseAI,
  onLogManual,
}: TodayMealsListProps) {
  const [sort, setSort] = useState<MealSort>('newest')

  const visibleMeals = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = query
      ? meals.filter((meal) => getMealSearchText(meal).includes(query))
      : [...meals]

    return filtered.sort((a, b) => {
      if (sort === 'highest-calories') {
        return Number(b.total_calories || 0) - Number(a.total_calories || 0)
      }
      if (sort === 'lowest-calories') {
        return Number(a.total_calories || 0) - Number(b.total_calories || 0)
      }

      const aTime = new Date(a.logged_at).getTime()
      const bTime = new Date(b.logged_at).getTime()
      return sort === 'oldest' ? aTime - bTime : bTime - aTime
    })
  }, [meals, search, sort])

  return (
    <section
      ref={sectionRef}
      id="today-meals"
      className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold tracking-[-0.02em] text-[#38323F]">
            {isToday ? "Today's Meals" : `${dateLabel}'s Meals`}
          </h2>
          <p className="mt-1 text-xs text-[#8B8690]">
            {isToday ? 'Review what you\'ve logged today.' : 'Review what you\'ve logged on this date.'}
          </p>
        </div>

        <label className="flex items-center gap-2">
          <span className="sr-only">Sort meals</span>
          <select
            value={sort}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => setSort(event.target.value as MealSort)}
            className="h-9 rounded-xl border border-[#7482A4]/15 bg-[#F8F7FA] px-3 text-xs font-bold text-[#5F5A64] outline-none focus:border-[#7482A4] focus:ring-2 focus:ring-[#7482A4]/15"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest-calories">Highest Calories</option>
            <option value="lowest-calories">Lowest Calories</option>
          </select>
        </label>
      </div>

      {meals.length === 0 ? (
        <div className="mt-5">
          <MealEmptyState
            dateLabel={dateLabel}
            isToday={isToday}
            onParseAI={onParseAI}
            onLogManual={onLogManual}
          />
        </div>
      ) : visibleMeals.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-[#7482A4]/20 bg-[#FAF9FB] px-5 py-10 text-center">
          <p className="text-sm font-extrabold text-[#38323F]">No matching meals</p>
          <p className="mt-1 text-xs text-[#8B8690]">Try another search term.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-2.5">
          {visibleMeals.map((meal) => {
            const type = String(meal.meal_type || 'meal').toLowerCase()

            return (
              <div
                key={meal.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectMeal(meal)}
                onKeyDown={(event: ReactKeyboardEvent<HTMLDivElement>) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onSelectMeal(meal)
                  }
                }}
                className="group grid cursor-pointer grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-[#7482A4]/10 bg-[#FCFBFD] p-3 transition hover:border-[#7482A4]/25 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] lg:grid-cols-[52px_minmax(0,1fr)_72px_72px_72px_64px_36px_30px]"
              >
                <MealImage src={getMealImageUrl(meal)} alt="" className="h-12 w-12 rounded-xl" />

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-[9px] font-extrabold capitalize ${
                        mealTypeStyles[type] ?? 'bg-[#7482A4]/10 text-[#7482A4]'
                      }`}
                    >
                      {type}
                    </span>
                    <span className="text-[10px] font-semibold text-[#9A949E]">
                      {formatMealTime(meal.logged_at)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm font-extrabold text-[#38323F]">
                    {getMealTitle(meal)}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-[#8B8690]">
                    {getMealSecondaryText(meal)}
                  </p>
                  <p className="mt-1 text-[10px] text-[#8B8690] lg:hidden">
                    {Math.round(Number(meal.total_calories || 0))} kcal ·{' '}
                    {formatMacroNumber(Number(meal.total_protein || 0))}g protein ·{' '}
                    {formatMacroNumber(Number(meal.total_carbs || 0))}g carbs ·{' '}
                    {formatMacroNumber(Number(meal.total_fat || 0))}g fat
                  </p>
                </div>

                {[
                  [Math.round(Number(meal.total_calories || 0)), 'kcal'],
                  [formatMacroNumber(Number(meal.total_protein || 0)), 'protein'],
                  [formatMacroNumber(Number(meal.total_carbs || 0)), 'carbs'],
                  [formatMacroNumber(Number(meal.total_fat || 0)), 'fat'],
                ].map(([value, label]) => (
                  <div key={label} className="hidden text-center lg:block">
                    <p className="text-xs font-extrabold text-[#38323F]">{value}</p>
                    <p className="text-[9px] text-[#8B8690]">{label}</p>
                  </div>
                ))}

                <button
                  type="button"
                  aria-label={`Delete ${getMealTitle(meal)}`}
                  onClick={(event: MouseEvent<HTMLButtonElement>) => {
                    event.stopPropagation()
                    onDeleteMeal(meal)
                  }}
                  className="hidden h-8 w-8 place-items-center rounded-xl text-[#B96F78] transition hover:bg-[#B96F78]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B96F78] lg:grid"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <ChevronRight className="h-4 w-4 justify-self-end text-[#A19CA5]" />
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
