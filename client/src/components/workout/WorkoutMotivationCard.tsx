import { BarChart3 } from 'lucide-react'

export function WorkoutMotivationCard() {
  return (
    <section className="relative min-h-[210px] overflow-hidden rounded-[24px] border border-[#E0E3EA] bg-gradient-to-br from-[#F3F4F7] to-[#E7EAF0] p-6 shadow-[0_8px_28px_rgba(56,50,63,0.04)]">
      <div className="absolute -right-10 top-4 h-44 w-44 rotate-[-18deg] rounded-[48px] border-[28px] border-white/40" />
      <div className="relative z-10 max-w-sm">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#7482A4] shadow-sm">
          <BarChart3 className="h-5 w-5" />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold leading-tight tracking-[-0.04em] text-[#38323F] sm:text-[28px]">
          Consistency Creates Results.
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#7482A4]">
          Show up. Put in the work. You&apos;ve got this!
        </p>
      </div>
    </section>
  )
}
