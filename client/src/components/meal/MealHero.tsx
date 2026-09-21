import type { SyntheticEvent } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'

import roccoMeal from '../../assets/images/rocco-meal-hero.png'

interface MealHeroProps {
  onParseAI: () => void
}

export function MealHero({ onParseAI }: MealHeroProps) {
  return (
    <section className="relative min-h-[226px] overflow-hidden rounded-[24px] bg-gradient-to-br from-[#7482A4] via-[#697896] to-[#596681] p-6 text-white shadow-[0_10px_30px_rgba(56,50,63,0.08)] sm:p-8">
      <div className="pointer-events-none absolute -left-12 top-16 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
      <div className="pointer-events-none absolute right-[28%] top-4 h-44 w-44 rounded-full bg-white/8 blur-2xl" />

      <div className="relative z-10 max-w-[68%] sm:max-w-[62%]">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" />
          Smart nutrition
        </div>

        <h2 className="mt-4 text-3xl font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-4xl">
          Fuel your day
          <br />
          the smart way! 🍽️
        </h2>

        <p className="mt-3 max-w-md text-sm leading-6 text-white/80 sm:text-[15px]">
          Describe your meal, review AI estimates, and log it in seconds.
        </p>

        <button
          type="button"
          onClick={onParseAI}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#5C6987] shadow-sm transition hover:bg-[#F5F3F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#7482A4]"
        >
          Parse with AI
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[40%] items-end justify-end">
        <div className="absolute bottom-[-45px] right-[-25px] h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <img
          src={roccoMeal}
          alt="Rocco, the FitPilot wolf mascot"
          className="relative max-h-[96%] w-full max-w-[300px] object-contain object-bottom"
          onError={(event: SyntheticEvent<HTMLImageElement>) => {
            event.currentTarget.style.display = 'none'
          }}
        />
      </div>
    </section>
  )
}
