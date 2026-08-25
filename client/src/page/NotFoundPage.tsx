import { useNavigate } from 'react-router-dom'

const ASSETS = {
  mascot: '/not-found/not-found%20mascot.png',
  back: '/not-found/back.png',
} as const

const STYLES = `
  @keyframes not-found-rise {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes not-found-mascot-enter {
    from { opacity: 0; transform: translateX(28px) scale(0.98); }
    to { opacity: 1; transform: translateX(0) scale(1); }
  }
  .not-found-code { animation: not-found-rise 520ms cubic-bezier(0.22, 1, 0.36, 1) both; }
  .not-found-mascot { animation: not-found-mascot-enter 720ms cubic-bezier(0.22, 1, 0.36, 1) 80ms both; }
  .not-found-content { animation: not-found-rise 600ms cubic-bezier(0.22, 1, 0.36, 1) 160ms both; }
  @media (prefers-reduced-motion: reduce) {
    .not-found-code, .not-found-mascot, .not-found-content { animation: none; }
  }
`

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <main className="min-h-dvh w-full bg-[#F5F3F6] font-['Poppins',ui-sans-serif,system-ui,sans-serif] text-[#38323F]">
      <style>{STYLES}</style>

      <section aria-labelledby="not-found-title" className="mx-auto grid min-h-dvh w-full max-w-7xl content-center px-5 py-10 sm:px-8 sm:py-12 md:px-12 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.82fr)] lg:grid-rows-[auto_auto] lg:gap-x-6 lg:px-16 lg:py-14 xl:px-20">
        <p aria-hidden="true" className="not-found-code text-center text-[clamp(5.5rem,21vw,9rem)] font-bold leading-[0.82] tracking-[-0.07em] text-[#7482A4] lg:col-start-1 lg:row-start-1 lg:self-end lg:text-left lg:text-[clamp(8rem,13vw,10.5rem)]">
          404
        </p>

        <div className="not-found-mascot mt-6 flex min-h-0 items-center justify-center lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">
          <img src={ASSETS.mascot} alt="Rocco looking confused while checking his phone" draggable={false} className="max-h-[42dvh] w-full select-none object-contain sm:max-h-[48dvh] lg:max-h-[72dvh]" />
        </div>

        <div className="not-found-content mt-7 flex flex-col items-center text-center lg:col-start-1 lg:row-start-2 lg:mt-8 lg:items-start lg:self-start lg:text-left">
          <h1 id="not-found-title" className="max-w-xl text-[clamp(2rem,6vw,3.25rem)] font-bold leading-[1.12] tracking-[-0.035em]">
            Oops! This page seems to be <span className="text-[#7482A4]">lost.</span>
          </h1>

          <p className="mt-4 max-w-lg text-[clamp(0.95rem,2vw,1.125rem)] leading-relaxed text-[#5F5966]">
            Looks like we took a wrong turn. Let&apos;s get you back on track.
          </p>

          <button type="button" onClick={() => navigate('/')} className="group mt-7 inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-[#7482A4] px-12 py-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(116,130,164,0.22)] transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#68789A] hover:shadow-[0_12px_26px_rgba(116,130,164,0.28)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7482A4]/25 active:translate-y-0 sm:text-base">
            <img src={ASSETS.back} alt="" aria-hidden="true" draggable={false} className="size-5 shrink-0 select-none object-contain transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Back to main page</span>
          </button>
        </div>
      </section>
    </main>
  )
}