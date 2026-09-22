import {
  Loader2,
  LockKeyhole,
} from 'lucide-react'
import {
  useState,
  type FormEvent,
} from 'react'

import type {
  ChangePasswordInput,
  SettingsMessageResponse,
} from '../../services/types/settings'
import { PasswordField } from './fields/PasswordField'
import { assessPassword } from './settings.utils'

interface SecurityCardProps {
  isSaving: boolean
  onSave: (
    input: ChangePasswordInput,
  ) => Promise<SettingsMessageResponse>
}

export function SecurityCard({
  isSaving,
  onSave,
}: SecurityCardProps) {
  const [
    currentPassword,
    setCurrentPassword,
  ] = useState('')
  const [
    newPassword,
    setNewPassword,
  ] = useState('')
  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('')
  const [error, setError] =
    useState<string | null>(null)

  const assessment =
    assessPassword(newPassword)

  const currentError =
    currentPassword
      ? null
      : 'Current password is required.'

  const newPasswordError =
    newPassword
      ? !assessment.isValid
        ? 'Use 8+ characters with uppercase, lowercase, number, and symbol.'
        : newPassword ===
            currentPassword
          ? 'New password must be different from the current password.'
          : null
      : 'New password is required.'

  const confirmError =
    confirmPassword
      ? confirmPassword !==
        newPassword
        ? 'Passwords do not match.'
        : null
      : 'Confirm your new password.'

  const hasInput =
    Boolean(currentPassword) ||
    Boolean(newPassword) ||
    Boolean(confirmPassword)

  const valid =
    !currentError &&
    !newPasswordError &&
    !confirmError

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (
      isSaving ||
      !valid
    ) {
      return
    }

    try {
      await onSave({
        current_password:
          currentPassword,
        new_password: newPassword,
      })

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setError(null)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not change your password.',
      )
    }
  }

  const strengthStyle =
    assessment.level === 'strong'
      ? {
          label: 'Strong',
          width: '100%',
          bar: 'bg-[#6F9B83]',
          text: 'text-[#6F9B83]',
        }
      : assessment.level ===
          'medium'
        ? {
            label: 'Medium',
            width: '66.666%',
            bar: 'bg-[#C6A45D]',
            text: 'text-[#C6A45D]',
          }
        : assessment.level ===
            'weak'
          ? {
              label: 'Weak',
              width: '33.333%',
              bar: 'bg-[#B96F78]',
              text: 'text-[#B96F78]',
            }
          : null

  return (
    <section
      id="security"
      className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#7482A4]/10 text-[#7482A4]">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
            Security
          </h2>
          <p className="mt-1 text-xs leading-5 text-[#817C86]">
            Change your password without storing it anywhere in the client.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <PasswordField
            id="settings-current-password"
            label="Current Password"
            value={currentPassword}
            onChange={(value) => {
              setCurrentPassword(
                value,
              )
              setError(null)
            }}
            autoComplete="current-password"
            error={
              hasInput
                ? currentError
                : null
            }
            disabled={isSaving}
            focusTarget
          />

          <div>
            <PasswordField
              id="settings-new-password"
              label="New Password"
              value={newPassword}
              onChange={(value) => {
                setNewPassword(value)
                setError(null)
              }}
              autoComplete="new-password"
              error={
                hasInput
                  ? newPasswordError
                  : null
              }
              disabled={isSaving}
            />

            {newPassword &&
            strengthStyle ? (
              <div className="mt-2">
                <div className="h-1 overflow-hidden rounded-full bg-[#38323F]/10">
                  <div
                    className={`h-full rounded-full transition-all ${strengthStyle.bar}`}
                    style={{
                      width:
                        strengthStyle.width,
                    }}
                  />
                </div>
                <p
                  className={`mt-1 text-[10px] font-semibold ${strengthStyle.text}`}
                >
                  {strengthStyle.label}{' '}
                  · 8+ · Aa · 1 · @
                </p>
              </div>
            ) : null}
          </div>

          <PasswordField
            id="settings-confirm-password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(value) => {
              setConfirmPassword(
                value,
              )
              setError(null)
            }}
            autoComplete="new-password"
            error={
              hasInput
                ? confirmError
                : null
            }
            disabled={isSaving}
          />
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-4 text-xs font-semibold leading-5 text-[#B96F78]"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={
              !hasInput ||
              !valid ||
              isSaving
            }
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#7482A4] px-5 text-sm font-extrabold text-white transition hover:bg-[#657493] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2 sm:w-auto"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {isSaving
              ? 'Changing Password...'
              : 'Change Password'}
          </button>
        </div>
      </form>
    </section>
  )
}
