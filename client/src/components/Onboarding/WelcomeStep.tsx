import { ArrowRight, Clock3, SlidersHorizontal } from 'lucide-react'

interface WelcomeStepProps { onContinue: () => void }

export default function WelcomeStep({ onContinue }: WelcomeStepProps) {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-69px)] w-full max-w-[980px] items-center px-5 py-12 sm:px-8 lg:min-h-dvh lg:px-12 lg:py-16 xl:px-16">
      <div className="w-full max-w-[760px]">
        <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.17em] text-[#7482A4]"><span className="h-px w-8 bg-[#7482A4]" aria-hidden="true" />Step 01 · Introduction</div>
        <h1 className="mt-7 max-w-[720px] text-[clamp(3rem,6.5vw,5.25rem)] font-semibold leading-[0.98] tracking-[-0.06em] text-[#38323F]">A plan built around you.</h1>
        <p className="mt-7 max-w-[650px] text-base leading-7 text-[#625C67] sm:text-lg sm:leading-8">Share a few details about your body, routine, and goal. FitPilot will calculate a practical starting plan you can adjust as you progress.</p>
        <div className="mt-9 grid max-w-[650px] gap-5 border-y border-[#38323F]/10 py-5 sm:grid-cols-2">
          <div className="flex items-center gap-3"><Clock3 size={19} className="shrink-0 text-[#7482A4]" aria-hidden="true" /><div><p className="text-sm font-semibold text-[#38323F]">About two minutes</p><p className="mt-0.5 text-xs text-[#77717C]">Four focused steps</p></div></div>
          <div className="flex items-center gap-3 sm:border-l sm:border-[#38323F]/10 sm:pl-5"><SlidersHorizontal size={19} className="shrink-0 text-[#7482A4]" aria-hidden="true" /><div><p className="text-sm font-semibold text-[#38323F]">Personal starting targets</p><p className="mt-0.5 text-xs text-[#77717C]">Calories, macros, and training</p></div></div>
        </div>
        <button type="button" onClick={onContinue} className="mt-9 inline-flex min-h-[52px] w-full items-center justify-center gap-3 rounded-[12px] bg-[#7482A4] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#657493] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7482A4]/20 sm:w-auto sm:min-w-[220px]">Begin setup<ArrowRight size={18} aria-hidden="true" /></button>
      </div>
    </section>
  )
}