import type { ChangeEvent } from 'react'

interface SettingsTextFieldProps {
  id: string
  label: string
  value: string
  onChange?: (value: string) => void
  type?: 'text' | 'email' | 'url'
  placeholder?: string
  autoComplete?: string
  readOnly?: boolean
  disabled?: boolean
  required?: boolean
  error?: string | null
  help?: string
  focusTarget?: boolean
}

export function SettingsTextField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
  readOnly = false,
  disabled = false,
  required = false,
  error,
  help,
  focusTarget = false,
}: SettingsTextFieldProps) {
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

      <input
        id={id}
        type={type}
        value={value}
        onChange={
          onChange
            ? (
                event: ChangeEvent<HTMLInputElement>,
              ) => onChange(event.target.value)
            : undefined
        }
        placeholder={placeholder}
        autoComplete={autoComplete}
        readOnly={readOnly}
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={descriptionId}
        data-settings-focus={
          focusTarget ? 'true' : undefined
        }
        className={[
          'h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition',
          readOnly
            ? 'cursor-default border-[#7482A4]/10 bg-[#F5F3F6] text-[#756F79]'
            : 'border-[#7482A4]/15 bg-[#FCFBFD] text-[#38323F] placeholder:text-[#AAA5AE] focus:border-[#7482A4] focus:ring-2 focus:ring-[#7482A4]/12',
          error
            ? 'border-[#B96F78]/60 focus:border-[#B96F78] focus:ring-[#B96F78]/10'
            : '',
          disabled
            ? 'cursor-not-allowed opacity-60'
            : '',
        ].join(' ')}
      />

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
