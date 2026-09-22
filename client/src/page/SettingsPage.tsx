import { Menu } from 'lucide-react'
import {
  useState,
} from 'react'
import { useOutletContext } from 'react-router-dom'

import { SettingsContent } from '../components/settings/SettingsContent'
import { SettingsErrorState } from '../components/settings/SettingsErrorState'
import { SettingsHeader } from '../components/settings/SettingsHeader'
import { SettingsSkeleton } from '../components/settings/SettingsSkeleton'
import {
  findSettingsSection,
  type SettingsSectionId,
} from '../components/settings/settings.utils'
import {
  useChangePassword,
  useRemoveSettingsAvatar,
  useSettings,
  useUploadSettingsAvatar,
  useUpdateGoalSettings,
  useUpdatePreferenceSettings,
  useUpdateProfileSettings,
} from '../hooks/useSettings'
import type { DashboardLayoutContext } from '../layouts/MainDashboardLayout'
import type {
  ChangePasswordInput,
  SettingsAvatarUpdateResponse,
  SettingsMessageResponse,
  SettingsUpdateResponse,
  UpdateGoalSettingsInput,
  UpdatePreferenceSettingsInput,
  UpdateProfileSettingsInput,
  UploadSettingsAvatarInput,
} from '../services/types/settings'
import { useToastStore } from '../stores/toastStore'

export function SettingsPage() {
  const { openSidebar } =
    useOutletContext<DashboardLayoutContext>()

  const settingsQuery =
    useSettings()
  const accountMutation =
    useUpdateProfileSettings()
  const avatarUploadMutation =
    useUploadSettingsAvatar()
  const avatarRemoveMutation =
    useRemoveSettingsAvatar()
  const profileMutation =
    useUpdateProfileSettings()
  const goalsMutation =
    useUpdateGoalSettings()
  const preferencesMutation =
    useUpdatePreferenceSettings()
  const passwordMutation =
    useChangePassword()

  const showToast =
    useToastStore(
      (state) =>
        state.showToast,
    )

  const [search, setSearch] =
    useState('')

  const settings =
    settingsQuery.data?.data

  const navigateToSection = (
    section: SettingsSectionId,
  ) => {
    const element =
      document.getElementById(
        section,
      )

    if (!element) return

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })

    window.setTimeout(() => {
      const focusTarget =
        element.querySelector<
          HTMLInputElement |
          HTMLSelectElement |
          HTMLButtonElement
        >(
          '[data-settings-focus="true"]',
        )

      focusTarget?.focus()
    }, 350)
  }

  const handleSearch = () => {
    const section =
      findSettingsSection(search)

    if (!section) {
      if (search.trim()) {
        showToast({
          type: 'info',
          heading:
            'Setting not found',
          subheading:
            'Try keywords like profile, goal, units, workout days, or password.',
        })
      }

      return
    }

    navigateToSection(section)
  }

  const updateAccount = async (
    input: UpdateProfileSettingsInput,
  ): Promise<SettingsUpdateResponse> => {
    try {
      const response =
        await accountMutation.mutateAsync(
          input,
        )

      showToast({
        type: 'success',
        heading:
          'Account updated',
        subheading:
          response.message,
      })

      return response
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not update your account information.'

      showToast({
        type: 'error',
        heading:
          'Account update failed',
        subheading: message,
      })

      throw error
    }
  }

  const uploadAvatar = async (
    input: UploadSettingsAvatarInput,
  ): Promise<SettingsAvatarUpdateResponse> => {
    try {
      const response =
        await avatarUploadMutation.mutateAsync(
          input,
        )

      showToast({
        type: 'success',
        heading:
          'Profile photo updated',
        subheading:
          response.message,
      })

      return response
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not upload your profile photo.'

      showToast({
        type: 'error',
        heading:
          'Photo upload failed',
        subheading: message,
      })

      throw error
    }
  }

  const removeAvatar = async (): Promise<SettingsAvatarUpdateResponse> => {
    try {
      const response =
        await avatarRemoveMutation.mutateAsync()

      showToast({
        type: 'success',
        heading:
          'Profile photo removed',
        subheading:
          response.message,
      })

      return response
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not remove your profile photo.'

      showToast({
        type: 'error',
        heading:
          'Photo removal failed',
        subheading: message,
      })

      throw error
    }
  }

  const updateProfile = async (
    input: UpdateProfileSettingsInput,
  ): Promise<SettingsUpdateResponse> => {
    try {
      const response =
        await profileMutation.mutateAsync(
          input,
        )

      showToast({
        type: 'success',
        heading:
          'Profile updated',
        subheading:
          response.message,
      })

      return response
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not update your profile.'

      showToast({
        type: 'error',
        heading:
          'Profile update failed',
        subheading: message,
      })

      throw error
    }
  }

  const updateGoals = async (
    input: UpdateGoalSettingsInput,
  ): Promise<SettingsUpdateResponse> => {
    try {
      const response =
        await goalsMutation.mutateAsync(
          input,
        )

      showToast({
        type: 'success',
        heading:
          'Goals updated',
        subheading:
          response.message,
      })

      return response
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not update your goals.'

      showToast({
        type: 'error',
        heading:
          'Goal update failed',
        subheading: message,
      })

      throw error
    }
  }

  const updatePreferences = async (
    input: UpdatePreferenceSettingsInput,
  ): Promise<SettingsUpdateResponse> => {
    try {
      const response =
        await preferencesMutation.mutateAsync(
          input,
        )

      showToast({
        type: 'success',
        heading:
          'Preferences updated',
        subheading:
          response.message,
      })

      return response
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not update your preferences.'

      showToast({
        type: 'error',
        heading:
          'Preference update failed',
        subheading: message,
      })

      throw error
    }
  }

  const updatePassword = async (
    input: ChangePasswordInput,
  ): Promise<SettingsMessageResponse> => {
    try {
      const response =
        await passwordMutation.mutateAsync(
          input,
        )

      showToast({
        type: 'success',
        heading:
          'Password changed',
        subheading:
          response.message,
      })

      return response
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not change your password.'

      showToast({
        type: 'error',
        heading:
          'Password change failed',
        subheading: message,
      })

      throw error
    }
  }

  return (
    <>
      {settings ? (
        <SettingsHeader
          account={
            settings.account
          }
          search={search}
          onSearchChange={
            setSearch
          }
          onSearchSubmit={
            handleSearch
          }
          onOpenSidebar={
            openSidebar
          }
        />
      ) : (
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={
              openSidebar
            }
            aria-label="Open navigation"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#7482A4]/15 bg-white text-[#38323F] shadow-sm lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-[-0.035em] text-[#38323F] sm:text-[34px]">
              Settings
            </h1>
            <p className="mt-1 text-sm text-[#77727B]">
              Loading your profile and preferences.
            </p>
          </div>
        </div>
      )}

      {settingsQuery.isLoading &&
      !settings ? (
        <SettingsSkeleton />
      ) : settings ? (
        <SettingsContent
          settings={settings}
          isAccountSaving={
            accountMutation.isPending
          }
          isAvatarUploading={
            avatarUploadMutation.isPending
          }
          isAvatarRemoving={
            avatarRemoveMutation.isPending
          }
          isProfileSaving={
            profileMutation.isPending
          }
          isGoalsSaving={
            goalsMutation.isPending
          }
          isPreferencesSaving={
            preferencesMutation.isPending
          }
          isPasswordSaving={
            passwordMutation.isPending
          }
          onUpdateAccount={
            updateAccount
          }
          onUploadAvatar={
            uploadAvatar
          }
          onRemoveAvatar={
            removeAvatar
          }
          onUpdateProfile={
            updateProfile
          }
          onUpdateGoals={
            updateGoals
          }
          onUpdatePreferences={
            updatePreferences
          }
          onChangePassword={
            updatePassword
          }
          onNavigate={
            navigateToSection
          }
        />
      ) : (
        <SettingsErrorState
          error={
            settingsQuery.error
              ?.message ?? null
          }
          isRetrying={
            settingsQuery.isFetching
          }
          onRetry={() => {
            void settingsQuery.refetch()
          }}
        />
      )}
    </>
  )
}