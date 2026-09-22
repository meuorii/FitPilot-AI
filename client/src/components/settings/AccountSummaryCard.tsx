import {
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Flame,
  UserCheck,
  XCircle,
} from 'lucide-react'

import type {
  SettingsAccount,
  SettingsMeta,
} from '../../services/types/settings'
import { formatUpdatedAt } from './settings.utils'

interface AccountSummaryCardProps {
  account: SettingsAccount
  meta: SettingsMeta
}

interface SummaryRowProps {
  icon: typeof BadgeCheck
  label: string
  value: string
  positive?: boolean
  negative?: boolean
}

function SummaryRow({
  icon: Icon,
  label,
  value,
  positive = false,
  negative = false,
}: SummaryRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#7482A4]/10 bg-[#FCFBFD] p-3.5">
      <div
        className={[
          'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
          positive
            ? 'bg-[#6F9B83]/10 text-[#6F9B83]'
            : negative
              ? 'bg-[#C6A45D]/10 text-[#9A7D3F]'
              : 'bg-[#7482A4]/10 text-[#7482A4]',
        ].join(' ')}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#918B95]">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-extrabold text-[#38323F]">
          {value}
        </p>
      </div>
    </div>
  )
}

export function AccountSummaryCard({
  account,
  meta,
}: AccountSummaryCardProps) {
  const streakLabel = `${meta.streak_count} ${
    meta.streak_count === 1
      ? 'day'
      : 'days'
  }`

  return (
    <section className="h-full rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
      <div className="flex items-center gap-2">
        <BadgeCheck className="h-5 w-5 text-[#7482A4]" />
        <h2 className="text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
          Account Summary
        </h2>
      </div>

      <p className="mt-1 text-xs leading-5 text-[#817C86]">
        A quick look at your account status.
      </p>

      <div className="mt-5 space-y-2">
        <SummaryRow
          icon={
            account.email_verified
              ? CheckCircle2
              : XCircle
          }
          label="Email Verified"
          value={
            account.email_verified
              ? 'Verified'
              : 'Not verified'
          }
          positive={
            account.email_verified
          }
          negative={
            !account.email_verified
          }
        />

        <SummaryRow
          icon={
            meta.is_onboarded
              ? UserCheck
              : XCircle
          }
          label="Onboarding"
          value={
            meta.is_onboarded
              ? 'Complete'
              : 'Incomplete'
          }
          positive={
            meta.is_onboarded
          }
          negative={
            !meta.is_onboarded
          }
        />

        <SummaryRow
          icon={Flame}
          label="Streak Count"
          value={streakLabel}
        />

        <SummaryRow
          icon={CalendarClock}
          label="Last Updated"
          value={formatUpdatedAt(
            meta.updated_at,
          )}
        />
      </div>
    </section>
  )
}
