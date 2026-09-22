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
    <section className="relative min-h-[286px] overflow-hidden rounded-[26px] bg-gradient-to-br from-[#7482A4] via-[#687794] to-[#58657E] p-6 text-white shadow-[0_14px_36px_rgba(56,50,63,0.10)] sm:p-8">
      <div className="pointer-events-none absolute -left-16 top-16 h-48 w-48 rounded-full bg-white/[0.06] blur-2xl" />
      <div className="pointer-events-none absolute right-[28%] top-8 h-40 w-40 rounded-full bg-white/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[48%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_66%)]" />

      <div className="relative z-10 max-w-[68%] sm:max-w-[61%]">
        <h2 className="text-3xl font-extrabold leading-[1.05] tracking-[-0.045em] sm:text-[40px]">
          Your coach is ready.
        </h2>

        <p className="mt-3 max-w-md text-sm leading-6 text-white/80 sm:text-[16px]">
          Ask about workouts, nutrition, recovery, or staying on track.
        </p>

        <div className="mt-6 grid max-w-[560px] grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2.5 border-white/20 sm:border-r sm:pr-4">
            <Target className="h-5 w-5 shrink-0 text-white/85" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/60">
                Goal
              </p>
              <p className="truncate text-xs font-extrabold text-white">
                {context?.goals.primary_goal_label || 'Loading goal...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 border-white/20 sm:border-r sm:px-4">
            <Flame className="h-5 w-5 shrink-0 text-white/85" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/60">
                Calories Today
              </p>
              <p className="truncate text-xs font-extrabold text-white">
                {calories
                  ? calories.target > 0
                    ? `${formatNumber(calories.consumed)} / ${formatNumber(calories.target)}`
                    : `${formatNumber(calories.consumed)} consumed`
                  : 'Loading...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:pl-4">
            <Dumbbell className="h-5 w-5 shrink-0 text-white/85" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/60">
                Protein Today
              </p>
              <p className="truncate text-xs font-extrabold text-white">
                {protein
                  ? protein.target > 0
                    ? `${formatNumber(protein.consumed)} / ${formatNumber(protein.target)}g`
                    : `${formatNumber(protein.consumed)}g consumed`
                  : 'Loading...'}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onStartChat}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#5E6C8C] shadow-sm transition hover:bg-[#F5F3F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#7482A4]"
        >
          Start chatting
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-0 right-[-16px] flex h-full w-[42%] items-end justify-end sm:right-0">
        <img
          src={roccoCoach}
          alt="Rocco, the FitPilot AI fitness coach"
          className="max-h-[96%] w-full max-w-[360px] object-contain object-bottom"
        />
      </div>
    </section>
  )
}
