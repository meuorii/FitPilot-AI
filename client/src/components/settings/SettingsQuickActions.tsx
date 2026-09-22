import type { LucideIcon } from 'lucide-react'
import {
  KeyRound,
  Ruler,
  Target,
  UserPen,
} from 'lucide-react'

import type { SettingsSectionId } from './settings.utils'
import { SETTINGS_SECTION_IDS } from './settings.utils'

interface SettingsQuickActionsProps {
  onNavigate: (
    section: SettingsSectionId,
  ) => void
}

interface Action {
  label: string
  description: string
  icon: LucideIcon
  section: SettingsSectionId
}

const actions: Action[] = [
  {
    label: 'Update profile',
    description:
      'Edit age, gender, height, or weight.',
    icon: UserPen,
    section:
      SETTINGS_SECTION_IDS.profile,
  },
  {
    label: 'Adjust goals',
    description:
      'Review targets and nutrition.',
    icon: Target,
    section:
      SETTINGS_SECTION_IDS.goals,
  },
  {
    label: 'Switch units',
    description:
      'Review your unit preference.',
    icon: Ruler,
    section:
      SETTINGS_SECTION_IDS.preferences,
  },
  {
    label: 'Change password',
    description:
      'Open your security settings.',
    icon: KeyRound,
    section:
      SETTINGS_SECTION_IDS.security,
  },
]

export function SettingsQuickActions({
  onNavigate,
}: SettingsQuickActionsProps) {
  return (
    <section className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
      <h2 className="text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
        Quick Actions
      </h2>
      <p className="mt-1 text-xs leading-5 text-[#817C86]">
        Jump straight to the setting you want to change.
      </p>

      <div className="mt-4 space-y-2">
        {actions.map(
          ({
            label,
            description,
            icon: Icon,
            section,
          }) => (
            <button
              key={label}
              type="button"
              onClick={() =>
                onNavigate(section)
              }
              className="flex w-full items-center gap-3 rounded-2xl border border-[#7482A4]/10 bg-[#FCFBFD] p-3.5 text-left transition hover:border-[#7482A4]/25 hover:bg-[#7482A4]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#7482A4]/10 text-[#7482A4]">
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-extrabold text-[#38323F]">
                  {label}
                </p>
                <p className="mt-0.5 text-[10px] leading-4 text-[#817C86]">
                  {description}
                </p>
              </div>
            </button>
          ),
        )}
      </div>
    </section>
  )
}
