import { Coffee, Cookie, Moon, Sun } from 'lucide-react'

import type { MealType } from '../../services/types/meal'

interface MealTypeSelectorProps {
  value: MealType
  onChange: (value: MealType) => void
  disabled?: boolean
}

const options = [
  { value: 'breakfast', label: 'Breakfast', icon: Coffee },
  { value: 'lunch', label: 'Lunch', icon: Sun },
  { value: 'dinner', label: 'Dinner', icon: Moon },
  { value: 'snack', label: 'Snack', icon: Cookie },
] as const

export function MealTypeSelector({
  value,
  onChange,
  disabled = false,
}: MealTypeSelectorProps) {
  return (
    <fieldset disabled={disabled}>
      <legend className="mb-2 text-xs font-extrabold text-[#38323F]">
        Meal Type
      </legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map(({ value: optionValue, label, icon: Icon }) => {
          const selected = value === optionValue

          return (
            <button
              key={optionValue}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(optionValue)}
              className={[
                'flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]',
                selected
                  ? 'border-[#7482A4] bg-[#7482A4] text-white'
                  : 'border-[#7482A4]/15 bg-white text-[#5F5A64] hover:bg-[#F5F3F6]',
              ].join(' ')}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
