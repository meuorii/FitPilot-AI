import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  CalendarDays,
  MailCheck,
  Settings2,
  Target,
} from 'lucide-react'
import { useState } from 'react'

import roccoSettingsHero from '../../assets/images/rocco-settings-hero.png'
import type { SettingsData } from '../../services/types/settings'
import {
  formatGoalLabel,
  formatUnitSystem,
} from './settings.utils'

interface SettingsHeroProps {
  settings: SettingsData
  onReviewPreferences: () => void
}

interface HeroMetricProps {
  icon: LucideIcon
  label: string
  value: string
}

function HeroMetric({
  icon: Icon,
  label,
  value,
}: HeroMetricProps) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 border-white/20 sm:border-r sm:last:border-r-0 sm:pr-3">
      <Icon className="h-5 w-5 shrink-0 text-white/90" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-white/65">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-extrabold text-white">
          {value}
        </p>
      </div>
    </div>
  )
}

export function SettingsHero({
  settings,
  onReviewPreferences,
}: SettingsHeroProps) {
  const [imageFailed, setImageFailed] =
    useState(false)

  const workoutDays =
    typeof settings.workout
      .workout_days_per_week ===
      'number'
      ? `${settings.workout.workout_days_per_week} / week`
      : 'Not set'

  return (
    <section className="relative isolate min-h-[350px] overflow-hidden rounded-[24px] bg-gradient-to-br from-[#667493] via-[#7482A4] to-[#8F9AB7] p-6 text-white shadow-[0_16px_36px_rgba(56,50,63,0.12)] sm:p-7 lg:min-h-[390px] lg:p-8">
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[44px] border-white/20" />
        <div className="absolute bottom-8 right-[32%] h-36 w-36 rotate-12 rounded-[42px] bg-white/10" />
        <div className="absolute left-[48%] top-10 h-2 w-2 rounded-full bg-white/70 shadow-[24px_0_0_rgba(255,255,255,.7),48px_0_0_rgba(255,255,255,.7),72px_0_0_rgba(255,255,255,.7),0_24px_0_rgba(255,255,255,.7),24px_24px_0_rgba(255,255,255,.7),48px_24px_0_rgba(255,255,255,.7),72px_24px_0_rgba(255,255,255,.7)]" />
      </div>

      <div className="relative z-10 max-w-[64%] sm:max-w-[59%] lg:max-w-[61%]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
          FitPilot Settings
        </p>

        <h2 className="mt-2 text-3xl font-extrabold leading-[1.04] tracking-[-0.04em] sm:text-4xl lg:text-[44px]">
          Keep your setup
          <br />
          dialed in.
        </h2>

        <p className="mt-3 max-w-lg text-sm leading-6 text-white/85 sm:text-base">
          Personalize FitPilot to get
          better guidance, more accurate
          insights, and faster results.
        </p>

        <div className="mt-7 grid max-w-[650px] grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <HeroMetric
            icon={Target}
            label="Primary Goal"
            value={formatGoalLabel(
              settings.goals
                .primary_goal,
            )}
          />

          <HeroMetric
            icon={Settings2}
            label="Unit System"
            value={formatUnitSystem(
              settings.profile
                .unit_system,
            )}
          />

          <HeroMetric
            icon={CalendarDays}
            label="Workout Days"
            value={workoutDays}
          />

          <HeroMetric
            icon={MailCheck}
            label="Email"
            value={
              settings.account
                .email_verified
                ? 'Verified'
                : 'Not verified'
            }
          />
        </div>

        <button
          type="button"
          onClick={
            onReviewPreferences
          }
          className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#667493] shadow-[0_10px_24px_rgba(56,50,63,0.14)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(56,50,63,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#7482A4] sm:px-6"
        >
          Review Preferences
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-0 right-[-5%] z-0 h-[94%] w-[49%] sm:right-[-1%] sm:w-[45%] lg:right-[1%] lg:w-[43%]">
        {!imageFailed ? (
          <img
            src={roccoSettingsHero}
            alt="Rocco helping with FitPilot settings"
            onError={() =>
              setImageFailed(true)
            }
            className="h-full w-full object-contain object-bottom"
            draggable={false}
          />
        ) : (
          <div className="grid h-full place-items-end pb-12">
            <div className="grid h-28 w-28 place-items-center rounded-[32px] border border-white/20 bg-white/10 text-white/80 backdrop-blur-sm">
              <Settings2 className="h-10 w-10" />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
