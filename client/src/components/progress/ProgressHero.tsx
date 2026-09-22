import {
  ArrowRight,
  Flag,
  Scale,
  Target,
  TrendingDown,
} from 'lucide-react'

import roccoProgressHero from '../../assets/images/rocco-progress-hero.png'
import type { ProgressGoalSummary } from '../../services/types/progress'
import {
  formatGoalLabel,
  formatWeight,
} from './progress.utils'

interface ProgressHeroProps {
  goal: ProgressGoalSummary
  onLogCheckIn: () => void
}

interface HeroMetricProps {
  label: string
  value: string
  icon: typeof Target
}

function HeroMetric({
  label,
  value,
  icon: Icon,
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

export function ProgressHero({
  goal,
  onLogCheckIn,
}: ProgressHeroProps) {
  return (
    <section className="relative isolate min-h-[350px] overflow-hidden rounded-[24px] bg-gradient-to-br from-[#667493] via-[#7482A4] to-[#8F9AB7] p-6 text-white shadow-[0_16px_36px_rgba(56,50,63,0.12)] sm:p-7 lg:min-h-[390px] lg:p-8">
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[44px] border-white/20" />
        <div className="absolute bottom-8 right-[32%] h-36 w-36 rotate-12 rounded-[42px] bg-white/10" />
        <div className="absolute left-[48%] top-10 h-2 w-2 rounded-full bg-white/70 shadow-[24px_0_0_rgba(255,255,255,.7),48px_0_0_rgba(255,255,255,.7),72px_0_0_rgba(255,255,255,.7),0_24px_0_rgba(255,255,255,.7),24px_24px_0_rgba(255,255,255,.7),48px_24px_0_rgba(255,255,255,.7),72px_24px_0_rgba(255,255,255,.7)]" />
      </div>

      <div className="relative z-10 max-w-[64%] sm:max-w-[59%] lg:max-w-[61%]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
          FitPilot Progress
        </p>

        <h2 className="mt-2 text-3xl font-extrabold leading-[1.04] tracking-[-0.04em] sm:text-4xl lg:text-[44px]">
          Your progress
          <br />
          tells the story.
        </h2>

        <p className="mt-3 max-w-lg text-sm leading-6 text-white/85 sm:text-base">
          Log check-ins, track body changes, and stay on course.
        </p>

        <div className="mt-7 grid max-w-[630px] grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <HeroMetric
            label="Goal"
            value={formatGoalLabel(goal.primary_goal)}
            icon={Target}
          />
          <HeroMetric
            label="Current Weight"
            value={formatWeight(goal.current_weight_kg, 'Not set')}
            icon={Scale}
          />
          <HeroMetric
            label="Target Weight"
            value={formatWeight(goal.target_weight_kg, 'Not set')}
            icon={Flag}
          />
          <HeroMetric
            label="Remaining"
            value={formatWeight(goal.remaining_kg, 'Not set')}
            icon={TrendingDown}
          />
        </div>

        <button
          type="button"
          onClick={onLogCheckIn}
          className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#667493] shadow-[0_10px_24px_rgba(56,50,63,0.14)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(56,50,63,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#7482A4] sm:px-6"
        >
          Log Check-In
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-0 right-[-5%] z-0 h-[94%] w-[49%] sm:right-[-1%] sm:w-[45%] lg:right-[1%] lg:w-[43%]">
        <img
          src={roccoProgressHero}
          alt="Rocco celebrating fitness progress"
          className="h-full w-full object-contain object-bottom"
          draggable={false}
        />
      </div>
    </section>
  )
}
