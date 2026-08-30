import { ArrowRight, Clock3, Timer } from 'lucide-react';

interface WelcomeStepProps { onContinue: () => void; }

export default function WelcomeStep({ onContinue }: WelcomeStepProps) {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-65px)] w-full max-w-4xl items-center px-5 py-10 sm:px-8 lg:min-h-dvh lg:px-12 lg:py-14 xl:px-16">
      <div className="w-full max-w-[680px]">
        <span className="inline-flex rounded-lg bg-[#7482A4]/[0.12] px-3.5 py-2 text-xs font-bold uppercase tracking-[0.09em] text-[#7482A4]">Step 1 of 4</span>
        <h1 className="mt-7 text-[clamp(2.75rem,6vw,5rem)] font-bold leading-[1.04] tracking-[-0.055em] text-[#38323F]">Welcome to<br />FitPilot AI</h1>
        <p className="mt-7 max-w-[650px] text-base leading-7 text-[#5F5964] sm:text-lg sm:leading-8">A smarter fitness plan starts with understanding you. Answer a few quick questions and Rocco will help build a plan around your goals, lifestyle, and routine.</p>
        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-medium text-[#746D79] sm:text-base">
          <span className="inline-flex items-center gap-2"><Clock3 size={21} className="text-[#7482A4]" aria-hidden="true" />4 quick steps</span>
          <span className="hidden size-1 rounded-full bg-[#7482A4]/60 sm:block" aria-hidden="true" />
          <span className="inline-flex items-center gap-2"><Timer size={21} className="text-[#7482A4]" aria-hidden="true" />About 2 minutes</span>
        </div>
        <button type="button" onClick={onContinue} className="mt-9 inline-flex min-h-14 w-full items-center justify-center gap-4 rounded-xl bg-[#7482A4] px-7 text-base font-bold text-white shadow-[0_14px_32px_rgba(116,130,164,0.28)] transition hover:-translate-y-0.5 hover:bg-[#657493] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7482A4]/25 active:translate-y-0 sm:w-auto sm:min-w-[310px]">
          Let&apos;s Get Started
          <ArrowRight size={22} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}