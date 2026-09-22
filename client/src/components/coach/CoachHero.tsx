import {
  ArrowRight,
  Dumbbell,
  Flame,
  Target,
} from 'lucide-react'

import roccoCoach from '../../assets/images/rocco-coach-hero.png'
import type { CoachContextData } from '../../services/types/coach'

interface CoachHeroProps {
  context?: CoachContextData
  onStartChat: () => void
}

const formatNumber = (value: number) => {
  const rounded = Math.round(value * 10) / 10
  return rounded.toLocaleString()
}

export function CoachHero({
  context,
  onStartChat,
}: CoachHeroProps) {
  const calories = context?.nutrition.calories
  const protein = context?.nutrition.protein

  return (
    <section className="relative isolate min-h-[350px] overflow-hidden rounded-[24px] bg-gradient-to-br from-[#667493] via-[#7482A4] to-[#8F9AB7] p-6 text-white shadow-[0_16px_36px_rgba(56,50,63,0.12)] sm:p-7 lg:min-h-[390px] lg:p-8">
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[44px] border-white/20" />
        <div className="absolute bottom-8 right-[32%] h-36 w-36 rotate-12 rounded-[42px] bg-white/10" />
        <div className="absolute left-[48%] top-10 h-2 w-2 rounded-full bg-white/70 shadow-[24px_0_0_rgba(255,255,255,.7),48px_0_0_rgba(255,255,255,.7),72px_0_0_rgba(255,255,255,.7),0_24px_0_rgba(255,255,255,.7),24px_24px_0_rgba(255,255,255,.7),48px_24px_0_rgba(255,255,255,.7),72px_24px_0_rgba(255,255,255,.7)]" />
      </div>

      <div className="relative z-10 max-w-[62%] sm:max-w-[58%] lg:max-w-[60%]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
          FitPilot AI Coach
        </p>

        <h2 className="mt-2 text-3xl font-extrabold leading-[1.04] tracking-[-0.04em] sm:text-4xl lg:text-[44px]">
          Your coach is ready.
        </h2>

        <p className="mt-3 max-w-lg text-sm leading-6 text-white/85 sm:text-base">
          Ask about workouts, nutrition, recovery, or staying on track.
        </p>

        <div className="mt-7 grid max-w-[540px] grid-cols-1 gap-3 text-white sm:grid-cols-3">
          <div className="flex items-center gap-2.5 border-white/20 sm:border-r">
            <Target className="h-5 w-5 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/65">
                Goal
              </p>
              <p className="mt-0.5 truncate text-sm font-extrabold">
                {context?.goals.primary_goal_label ?? 'Loading...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 border-white/20 sm:border-r sm:px-3">
            <Flame className="h-5 w-5 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/65">
                Calories Today
              </p>
              <p className="mt-0.5 truncate text-sm font-extrabold">
                {calories
                  ? calories.target > 0
                    ? `${formatNumber(calories.consumed)} / ${formatNumber(calories.target)}`
                    : `${formatNumber(calories.consumed)} kcal`
                  : 'Loading...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:pl-3">
            <Dumbbell className="h-5 w-5 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/65">
                Protein Today
              </p>
              <p className="mt-0.5 truncate text-sm font-extrabold">
                {protein
                  ? protein.target > 0
                    ? `${formatNumber(protein.consumed)} / ${formatNumber(protein.target)}g`
                    : `${formatNumber(protein.consumed)}g`
                  : 'Loading...'}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onStartChat}
          className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#667493] shadow-[0_10px_24px_rgba(56,50,63,0.14)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(56,50,63,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#7482A4] sm:px-6"
        >
          Start chatting
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-0 right-[-4%] z-0 h-[94%] w-[48%] sm:right-[1%] sm:w-[44%] lg:right-[2%] lg:w-[42%]">
        <img
          src={roccoCoach}
          alt="Rocco, the FitPilot wolf AI coach"
          className="h-full w-full object-contain object-bottom"
          draggable={false}
        />
      </div>
    </section>
  )
}
