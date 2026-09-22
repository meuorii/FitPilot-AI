import type { ChangeEvent } from 'react'

interface SettingsNumberFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  min?: number
  max?: number
  step?: number
  suffix?: string
  error?: string | null
  help?: string
  disabled?: boolean
  focusTarget?: boolean
}

export function SettingsNumberField({
  id,
  label,
  value,
  onChange,
  placeholder,
  min,
  max,
  step = 1,
  suffix,
  error,
  help,
  disabled = false,
  focusTarget = false,
}: SettingsNumberFieldProps) {
  const descriptionId = error
    ? `${id}-error`
    : help
      ? `${id}-help`
      : undefined

  return (
    <label
      htmlFor={id}
      className="block min-w-0"
    >
      <span className="mb-1.5 block text-xs font-bold text-[#5F5A64]">
        {label}
      </span>

      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(
            event: ChangeEvent<HTMLInputElement>,
          ) => onChange(event.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionId}
          data-settings-focus={
            focusTarget ? 'true' : undefined
          }
          className={[
            'h-11 w-full rounded-xl border border-[#7482A4]/15 bg-[#FCFBFD] px-3.5 text-sm text-[#38323F] outline-none transition placeholder:text-[#AAA5AE] focus:border-[#7482A4] focus:ring-2 focus:ring-[#7482A4]/12',
            suffix ? 'pr-14' : '',
            error
              ? 'border-[#B96F78]/60 focus:border-[#B96F78] focus:ring-[#B96F78]/10'
              : '',
            disabled
              ? 'cursor-not-allowed opacity-60'
              : '',
          ].join(' ')}
        />

        {suffix ? (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#918B95]">
            {suffix}
          </span>
        ) : null}
      </div>

      {error ? (
        <span
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 block text-[11px] font-semibold leading-4 text-[#B96F78]"
        >
          {error}
        </span>
      ) : help ? (
        <span
          id={`${id}-help`}
          className="mt-1.5 block text-[10px] leading-4 text-[#918B95]"
        >
          {help}
        </span>
      ) : null}
    </label>
  )
}
