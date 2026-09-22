import type {
  ChangePasswordInput,
  SettingsAvatarUpdateResponse,
  SettingsData,
  SettingsMessageResponse,
  SettingsUpdateResponse,
  UpdateGoalSettingsInput,
  UpdatePreferenceSettingsInput,
  UpdateProfileSettingsInput,
  UploadSettingsAvatarInput,
} from '../../services/types/settings'
import { AccountInformationCard } from './AccountInformationCard'
import { AccountSummaryCard } from './AccountSummaryCard'
import { GoalSnapshotCard } from './GoalSnapshotCard'
import { GoalsNutritionCard } from './GoalsNutritionCard'
import { PreferencesCard } from './PreferencesCard'
import { ProfileInformationCard } from './ProfileInformationCard'
import { SecurityCard } from './SecurityCard'
import { SettingsHero } from './SettingsHero'
import { SettingsQuickActions } from './SettingsQuickActions'
import type { SettingsSectionId } from './settings.utils'

interface SettingsContentProps {
  settings: SettingsData
  isAccountSaving: boolean
  isAvatarUploading: boolean
  isAvatarRemoving: boolean
  isProfileSaving: boolean
  isGoalsSaving: boolean
  isPreferencesSaving: boolean
  isPasswordSaving: boolean
  onUpdateAccount: (
    input: UpdateProfileSettingsInput,
  ) => Promise<SettingsUpdateResponse>
  onUploadAvatar: (
    input: UploadSettingsAvatarInput,
  ) => Promise<SettingsAvatarUpdateResponse>
  onRemoveAvatar: () => Promise<SettingsAvatarUpdateResponse>
  onUpdateProfile: (
    input: UpdateProfileSettingsInput,
  ) => Promise<SettingsUpdateResponse>
  onUpdateGoals: (
    input: UpdateGoalSettingsInput,
  ) => Promise<SettingsUpdateResponse>
  onUpdatePreferences: (
    input: UpdatePreferenceSettingsInput,
  ) => Promise<SettingsUpdateResponse>
  onChangePassword: (
    input: ChangePasswordInput,
  ) => Promise<SettingsMessageResponse>
  onNavigate: (
    section: SettingsSectionId,
  ) => void
}

export function SettingsContent({
  settings,
  isAccountSaving,
  isAvatarUploading,
  isAvatarRemoving,
  isProfileSaving,
  isGoalsSaving,
  isPreferencesSaving,
  isPasswordSaving,
  onUpdateAccount,
  onUploadAvatar,
  onRemoveAvatar,
  onUpdateProfile,
  onUpdateGoals,
  onUpdatePreferences,
  onChangePassword,
  onNavigate,
}: SettingsContentProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 2xl:grid-cols-[minmax(0,2.15fr)_minmax(300px,0.85fr)]">
        <SettingsHero
          settings={settings}
          onReviewPreferences={() =>
            onNavigate(
              'preferences',
            )
          }
        />

        <AccountSummaryCard
          account={settings.account}
          meta={settings.meta}
        />
      </div>

      <div className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,2.15fr)_minmax(300px,0.85fr)]">
        <div className="grid min-w-0 gap-5 xl:grid-cols-2">
          <AccountInformationCard
            account={settings.account}
            isSaving={
              isAccountSaving
            }
            isUploadingAvatar={
              isAvatarUploading
            }
            isRemovingAvatar={
              isAvatarRemoving
            }
            onSave={
              onUpdateAccount
            }
            onUploadAvatar={
              onUploadAvatar
            }
            onRemoveAvatar={
              onRemoveAvatar
            }
          />

          <ProfileInformationCard
            profile={settings.profile}
            isSaving={
              isProfileSaving
            }
            onSave={
              onUpdateProfile
            }
          />

          <GoalsNutritionCard
            goals={settings.goals}
            isSaving={
              isGoalsSaving
            }
            onSave={
              onUpdateGoals
            }
          />

          <PreferencesCard
            profile={settings.profile}
            workout={settings.workout}
            isSaving={
              isPreferencesSaving
            }
            onSave={
              onUpdatePreferences
            }
          />

          <div className="min-w-0 xl:col-span-2">
            <SecurityCard
              isSaving={
                isPasswordSaving
              }
              onSave={
                onChangePassword
              }
            />
          </div>
        </div>

        <aside className="min-w-0 space-y-5">
          <GoalSnapshotCard
            settings={settings}
            onEdit={() =>
              onNavigate(
                'goals-nutrition',
              )
            }
          />

          <SettingsQuickActions
            onNavigate={onNavigate}
          />
        </aside>
      </div>
    </div>
  )
}