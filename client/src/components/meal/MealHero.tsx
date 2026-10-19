import type { SyntheticEvent } from 'react'
import { ArrowRight, Sparkles, Utensils, Droplets, WandSparkles } from 'lucide-react'
import roccoMeal from '../../assets/images/rocco-meal-hero.png'

interface MealHeroProps { onParseAI: () => void }

export function MealHero({ onParseAI }: MealHeroProps) {
  return (
    <section className="relative isolate min-h-[245px] overflow-hidden rounded-[24px] bg-gradient-to-br from-[#7482A4] via-[#667493] to-[#55617C] p-5 text-white shadow-sm sm:min-h-[270px] sm:p-7">
      <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-14 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute right-[22%] top-0 h-full w-px rotate-[35deg] bg-white/10" />
      <div className="relative z-10 max-w-[68%] sm:max-w-[65%]">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/12 px-3 py-1.5 text-[10px] font-extrabold text-white backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" /> AI MEAL ASSISTANT
        </div>
        <h2 className="mt-3 text-[clamp(1.55rem,2.3vw,2.25rem)] font-extrabold leading-[1.08] tracking-[-0.04em] text-white">
          Turn your cravings<br className="hidden sm:block" /> into a plan!
        </h2>
        <p className="mt-2 max-w-[370px] text-xs leading-5 text-white/80 sm:text-sm sm:leading-6">
          Describe what you ate, paste a nutrition table, or let Rocco estimate your meal.
        </p>
        <div className="mt-3 hidden flex-wrap gap-x-4 gap-y-2 text-[10px] font-semibold text-white/85 sm:flex">
          <span className="inline-flex items-center gap-1.5"><WandSparkles className="h-4 w-4" /> AI meal analysis</span>
          <span className="inline-flex items-center gap-1.5"><Droplets className="h-4 w-4" /> Macro estimates</span>
          <span className="inline-flex items-center gap-1.5"><Utensils className="h-4 w-4" /> Easy meal logging</span>
        </div>
        <button type="button" onClick={onParseAI} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-[#53607D] shadow-sm transition hover:bg-[#F5F3F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#667493]">
          Open Meal Parser <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[40%] items-end justify-end sm:w-[38%]">
        <div className="absolute -right-10 top-3 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <img src={roccoMeal} alt="Rocco, the FitPilot wolf mascot, holding a healthy meal" draggable={false} className="relative max-h-[98%] w-full max-w-[290px] object-contain object-bottom drop-shadow-[0_12px_14px_rgba(25,22,30,0.18)]" onError={(event: SyntheticEvent<HTMLImageElement>) => { event.currentTarget.style.display = 'none' }} />
      </div>
    </section>
  )
}
