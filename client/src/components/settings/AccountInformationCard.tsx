import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
  UserRound,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'

import type {
  SettingsAccount,
  SettingsAvatarUpdateResponse,
  SettingsUpdateResponse,
  UpdateProfileSettingsInput,
  UploadSettingsAvatarInput,
} from '../../services/types/settings'
import { SettingsTextField } from './fields/SettingsTextField'
import { getInitials } from './settings.utils'

interface AccountInformationCardProps {
  account: SettingsAccount
  isSaving: boolean
  isUploadingAvatar: boolean
  isRemovingAvatar: boolean
  onSave: (
    input: UpdateProfileSettingsInput,
  ) => Promise<SettingsUpdateResponse>
  onUploadAvatar: (
    input: UploadSettingsAvatarInput,
  ) => Promise<SettingsAvatarUpdateResponse>
  onRemoveAvatar: () => Promise<SettingsAvatarUpdateResponse>
}

interface AccountDraft {
  fullName: string
}

const MAX_AVATAR_BYTES =
  5 * 1024 * 1024

const ALLOWED_AVATAR_TYPES =
  new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
  ])

const toDraft = (
  account: SettingsAccount,
): AccountDraft => ({
  fullName: account.full_name,
})

export function AccountInformationCard({
  account,
  isSaving,
  isUploadingAvatar,
  isRemovingAvatar,
  onSave,
  onUploadAvatar,
  onRemoveAvatar,
}: AccountInformationCardProps) {
  const fileInputRef =
    useRef<HTMLInputElement>(null)

  const [draft, setDraft] =
    useState<AccountDraft>(() =>
      toDraft(account),
    )

  const [
    selectedAvatar,
    setSelectedAvatar,
  ] = useState<File | null>(null)

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState<string | null>(null)

  const [error, setError] =
    useState<string | null>(null)

  const [
    avatarError,
    setAvatarError,
  ] = useState<string | null>(null)

  const [
    avatarFailed,
    setAvatarFailed,
  ] = useState(false)

  const dirty = useMemo(
    () =>
      draft.fullName.trim() !==
      account.full_name.trim(),
    [
      account.full_name,
      draft.fullName,
    ],
  )

  useEffect(() => {
    if (!dirty) {
      setDraft(toDraft(account))
    }
  }, [account, dirty])

  useEffect(() => {
    setAvatarFailed(false)
  }, [account.avatar_url])

  useEffect(() => {
    if (!selectedAvatar) {
      setPreviewUrl(null)
      return
    }

    const objectUrl =
      URL.createObjectURL(
        selectedAvatar,
      )

    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(
        objectUrl,
      )
    }
  }, [selectedAvatar])

  const fullNameError =
    draft.fullName.trim()
      ? draft.fullName.trim().length >
        120
        ? 'Full name must be 120 characters or fewer.'
        : null
      : 'Full name is required.'

  const handleAvatarSelection = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0] ??
      null

    setAvatarError(null)

    if (!file) {
      setSelectedAvatar(null)
      return
    }

    if (
      !ALLOWED_AVATAR_TYPES.has(
        file.type,
      )
    ) {
      setSelectedAvatar(null)
      setAvatarError(
        'Choose a JPG, PNG, or WebP image.',
      )
      event.target.value = ''
      return
    }

    if (
      file.size >
      MAX_AVATAR_BYTES
    ) {
      setSelectedAvatar(null)
      setAvatarError(
        'Profile photo must be 5 MB or smaller.',
      )
      event.target.value = ''
      return
    }

    setSelectedAvatar(file)
  }

  const clearSelectedAvatar =
    () => {
      setSelectedAvatar(null)
      setAvatarError(null)

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          ''
      }
    }

  const handleUploadAvatar =
    async () => {
      if (
        !selectedAvatar ||
        isUploadingAvatar ||
        isRemovingAvatar
      ) {
        return
      }

      try {
        await onUploadAvatar({
          file: selectedAvatar,
        })

        clearSelectedAvatar()
        setAvatarFailed(false)
      } catch (uploadError) {
        setAvatarError(
          uploadError instanceof Error
            ? uploadError.message
            : 'Could not upload your profile photo.',
        )
      }
    }

  const handleRemoveAvatar =
    async () => {
      if (
        !account.avatar_url ||
        isUploadingAvatar ||
        isRemovingAvatar
      ) {
        return
      }

      try {
        await onRemoveAvatar()

        clearSelectedAvatar()
        setAvatarFailed(false)
      } catch (removeError) {
        setAvatarError(
          removeError instanceof Error
            ? removeError.message
            : 'Could not remove your profile photo.',
        )
      }
    }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (
      isSaving ||
      !dirty ||
      fullNameError
    ) {
      return
    }

    try {
      const response =
        await onSave({
          full_name:
            draft.fullName.trim(),
        })

      setDraft(
        toDraft(
          response.data.account,
        ),
      )
      setError(null)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not save account changes.',
      )
    }
  }

  const displayedAvatar =
    previewUrl ??
    account.avatar_url

  const showAvatar =
    Boolean(displayedAvatar) &&
    !avatarFailed

  const avatarBusy =
    isUploadingAvatar ||
    isRemovingAvatar

  return (
    <section
      id="account-information"
      className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#7482A4]/10 text-[#7482A4]">
          <UserRound className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
            Account Information
          </h2>
          <p className="mt-1 text-xs leading-5 text-[#817C86]">
            Update your name and profile photo.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[#7482A4]/10 bg-[#7482A4]/[0.045] p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            {showAvatar ? (
              <img
                src={
                  displayedAvatar ??
                  ''
                }
                alt={`${draft.fullName || 'User'} profile preview`}
                onError={() =>
                  setAvatarFailed(
                    true,
                  )
                }
                className="h-20 w-20 rounded-[22px] border border-white object-cover shadow-sm"
              />
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-[22px] bg-[#7482A4] text-lg font-extrabold text-white shadow-sm">
                {getInitials(
                  draft.fullName,
                )}
              </div>
            )}

            {selectedAvatar ? (
              <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-[#6F9B83] text-white">
                <ImagePlus className="h-3.5 w-3.5" />
              </span>
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-[#38323F]">
              {selectedAvatar
                ? selectedAvatar.name
                : account.avatar_url
                  ? 'Current profile photo'
                  : 'Add a profile photo'}
            </p>

            <p className="mt-1 text-[11px] leading-5 text-[#817C86]">
              JPG, PNG, or WebP · maximum 5 MB.
            </p>

            <input
              ref={fileInputRef}
              id="settings-avatar-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={
                handleAvatarSelection
              }
              disabled={avatarBusy}
              className="sr-only"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <label
                htmlFor="settings-avatar-file"
                className={[
                  'inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#7482A4]/20 bg-white px-3.5 text-[11px] font-extrabold text-[#7482A4] transition hover:bg-[#7482A4]/[0.06] focus-within:ring-2 focus-within:ring-[#7482A4]',
                  avatarBusy
                    ? 'pointer-events-none opacity-50'
                    : '',
                ].join(' ')}
              >
                <ImagePlus className="h-4 w-4" />
                {account.avatar_url
                  ? 'Choose New Photo'
                  : 'Choose Photo'}
              </label>

              {selectedAvatar ? (
                <>
                  <button
                    type="button"
                    onClick={
                      handleUploadAvatar
                    }
                    disabled={
                      avatarBusy
                    }
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#7482A4] px-3.5 text-[11px] font-extrabold text-white transition hover:bg-[#657493] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {isUploadingAvatar
                      ? 'Uploading...'
                      : 'Upload Photo'}
                  </button>

                  <button
                    type="button"
                    onClick={
                      clearSelectedAvatar
                    }
                    disabled={
                      avatarBusy
                    }
                    className="inline-flex h-9 items-center justify-center rounded-xl px-3 text-[11px] font-bold text-[#817C86] transition hover:bg-white disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </>
              ) : null}

              {account.avatar_url &&
              !selectedAvatar ? (
                <button
                  type="button"
                  onClick={
                    handleRemoveAvatar
                  }
                  disabled={
                    avatarBusy
                  }
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-[#B96F78]/20 bg-white px-3.5 text-[11px] font-extrabold text-[#B96F78] transition hover:bg-[#B96F78]/[0.06] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B96F78]/40"
                >
                  {isRemovingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  {isRemovingAvatar
                    ? 'Removing...'
                    : 'Remove'}
                </button>
              ) : null}
            </div>

            {avatarError ? (
              <p
                role="alert"
                className="mt-2 text-[11px] font-semibold leading-4 text-[#B96F78]"
              >
                {avatarError}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5 space-y-4"
      >
        <SettingsTextField
          id="settings-full-name"
          label="Full Name"
          value={draft.fullName}
          onChange={(value) => {
            setDraft({
              fullName: value,
            })
            setError(null)
          }}
          autoComplete="name"
          error={fullNameError}
          focusTarget
        />

        <SettingsTextField
          id="settings-email"
          label="Email"
          type="email"
          value={account.email}
          readOnly
          help="Email changes are not supported by the current Settings API."
        />

        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#7482A4]/10 px-3.5 py-3">
          <div>
            <p className="text-xs font-bold text-[#5F5A64]">
              Email Verified
            </p>
            <p className="mt-0.5 text-[10px] text-[#918B95]">
              Read-only account status
            </p>
          </div>

          <span
            className={[
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold',
              account.email_verified
                ? 'bg-[#6F9B83]/10 text-[#6F9B83]'
                : 'bg-[#C6A45D]/10 text-[#9A7D3F]',
            ].join(' ')}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {account.email_verified
              ? 'Verified'
              : 'Not verified'}
          </span>
        </div>

        {error ? (
          <p
            role="alert"
            className="text-xs font-semibold leading-5 text-[#B96F78]"
          >
            {error}
          </p>
        ) : dirty ? (
          <p className="text-[11px] font-semibold text-[#7482A4]">
            Unsaved name change
          </p>
        ) : null}

        <button
          type="submit"
          disabled={
            !dirty ||
            Boolean(
              fullNameError,
            ) ||
            isSaving
          }
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#7482A4] px-4 text-sm font-extrabold text-white transition hover:bg-[#657493] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          {isSaving
            ? 'Saving...'
            : 'Save Account Changes'}
        </button>
      </form>
    </section>
  )
}