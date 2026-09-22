import type { ChangeEvent } from 'react'

export interface SettingsSelectOption {
  value: string
  label: string
}

interface SettingsSelectFieldProps {
  id: string
  label: string
  value: string
  options: SettingsSelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  error?: string | null
  help?: string
  disabled?: boolean
  focusTarget?: boolean
}

export function SettingsSelectField({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  error,
  help,
  disabled = false,
  focusTarget = false,
}: SettingsSelectFieldProps) {
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

      <select
        id={id}
        value={value}
        onChange={(
          event: ChangeEvent<HTMLSelectElement>,
        ) => onChange(event.target.value)}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={descriptionId}
        data-settings-focus={
          focusTarget ? 'true' : undefined
        }
        className={[
          'h-11 w-full rounded-xl border border-[#7482A4]/15 bg-[#FCFBFD] px-3.5 text-sm text-[#38323F] outline-none transition focus:border-[#7482A4] focus:ring-2 focus:ring-[#7482A4]/12',
          error
            ? 'border-[#B96F78]/60 focus:border-[#B96F78] focus:ring-[#B96F78]/10'
            : '',
          disabled
            ? 'cursor-not-allowed opacity-60'
            : '',
        ].join(' ')}
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

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
