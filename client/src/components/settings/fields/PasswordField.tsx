import {
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  useState,
  type ChangeEvent,
} from 'react'

interface PasswordFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: 'current-password' | 'new-password'
  placeholder?: string
  error?: string | null
  help?: string
  disabled?: boolean
  focusTarget?: boolean
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder = '••••••••••••',
  error,
  help,
  disabled = false,
  focusTarget = false,
}: PasswordFieldProps) {
  const [visible, setVisible] =
    useState(false)

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
          type={
            visible
              ? 'text'
              : 'password'
          }
          value={value}
          onChange={(
            event: ChangeEvent<HTMLInputElement>,
          ) =>
            onChange(
              event.target.value,
            )
          }
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionId}
          data-settings-focus={
            focusTarget ? 'true' : undefined
          }
          className={[
            'h-11 w-full rounded-xl border border-[#7482A4]/15 bg-[#FCFBFD] px-3.5 pr-11 text-sm text-[#38323F] outline-none transition placeholder:text-[#AAA5AE] focus:border-[#7482A4] focus:ring-2 focus:ring-[#7482A4]/12',
            error
              ? 'border-[#B96F78]/60 focus:border-[#B96F78] focus:ring-[#B96F78]/10'
              : '',
            disabled
              ? 'cursor-not-allowed opacity-60'
              : '',
          ].join(' ')}
        />

        <button
          type="button"
          onClick={() =>
            setVisible(
              (current) =>
                !current,
            )
          }
          disabled={disabled}
          aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-[#817C86] transition hover:bg-[#7482A4]/10 hover:text-[#7482A4] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
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
