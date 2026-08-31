import { Check, ClipboardCheck, Hand, Target, UserRound } from 'lucide-react'

interface OnboardingSidebarProps { currentStep: 1 | 2 | 3 | 4 }

const steps = [
  { number: 1, label: 'Welcome', icon: Hand },
  { number: 2, label: 'About you', icon: UserRound },
  { number: 3, label: 'Your goal', icon: Target },
  { number: 4, label: 'Your plan', icon: ClipboardCheck },
] as const

const sidebarImages: Record<OnboardingSidebarProps['currentStep'], string> = {
  1: '/onboarding/onboarding-left/step1.png',
  2: '/onboarding/onboarding-left/step2.png',
  3: '/onboarding/onboarding-left/step3.png',
  4: '/onboarding/onboarding-left/step4.png',
}

export default function OnboardingSidebar({ currentStep }: OnboardingSidebarProps) {
  const currentLabel = steps[currentStep - 1].label

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh self-start overflow-hidden border-r border-[#38323F]/10 bg-[#ECE9EF] lg:grid lg:grid-rows-[auto_auto_minmax(0,1fr)]">
        <header className="px-8 pb-6 pt-8 xl:px-10 xl:pt-9">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7482A4]">FitPilot AI</p>
          <h2 className="mt-3 text-[28px] font-semibold leading-none tracking-[-0.04em] text-[#38323F]">Personal setup</h2>
          <p className="mt-3 max-w-[260px] text-[13px] leading-5 text-[#6B6570]">Four short steps to set your starting targets.</p>
        </header>

        <nav className="px-5 xl:px-7" aria-label="Onboarding progress">
          <ol className="relative">
            {steps.map((step, index) => {
              const isComplete = step.number < currentStep
              const isCurrent = step.number === currentStep
              const Icon = step.icon

              return (
                <li key={step.number} className="relative">
                  {index < steps.length - 1 && <span className={`absolute left-[33px] top-[42px] h-[24px] w-px ${isComplete ? 'bg-[#7482A4]' : 'bg-[#38323F]/15'}`} aria-hidden="true" />}
                  <div className={`flex h-[66px] items-center gap-3 rounded-[14px] border px-3 transition-colors ${isCurrent ? 'border-[#38323F]/10 bg-white' : 'border-transparent'}`} aria-current={isCurrent ? 'step' : undefined}>
                    <span className={`relative z-10 grid size-9 shrink-0 place-items-center rounded-full border ${isCurrent ? 'border-[#7482A4] bg-[#7482A4] text-white' : isComplete ? 'border-[#7482A4] bg-[#ECE9EF] text-[#7482A4]' : 'border-[#38323F]/20 bg-[#ECE9EF] text-[#77717C]'}`} aria-hidden="true">
                      {isComplete ? <Check size={16} strokeWidth={2.5} /> : <Icon size={16} strokeWidth={1.9} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A8490]">Step {step.number}</span>
                      <span className={`mt-0.5 block text-sm ${isCurrent ? 'font-semibold text-[#38323F]' : 'font-medium text-[#6B6570]'}`}>{step.label}</span>
                    </span>
                    {isCurrent && <span className="size-1.5 rounded-full bg-[#7482A4]" aria-hidden="true" />}
                  </div>
                </li>
              )
            })}
          </ol>
        </nav>

        <div className="min-h-0 px-7 pb-5 pt-3 xl:px-9 xl:pb-6">
          <div className="flex h-full min-h-[210px] flex-col items-center justify-end overflow-hidden rounded-[20px] border border-[#38323F]/10 bg-[#F5F3F6]">
            <div className="flex min-h-0 w-full flex-1 items-end justify-center px-4 pt-3">
              <img key={currentStep} src={sidebarImages[currentStep]} alt={`Rocco for ${currentLabel}`} className="h-[clamp(205px,29vh,285px)] w-[280px] max-w-full select-none object-contain object-bottom" draggable={false} />
            </div>
            <div className="flex h-11 w-full shrink-0 items-center justify-between border-t border-[#38323F]/10 bg-white px-4">
              <span className="text-xs font-semibold text-[#38323F]">{currentLabel}</span>
              <span className="text-[11px] font-medium text-[#77717C]">{currentStep} / 4</span>
            </div>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-[#38323F]/10 bg-[#F5F3F6]/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7482A4]">FitPilot AI</p>
              <p className="mt-0.5 text-sm font-semibold text-[#38323F]">{currentLabel}</p>
            </div>
            <p className="text-xs font-medium text-[#6B6570]">Step {currentStep} of 4</p>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden="true">
            {steps.map((step) => <span key={step.number} className={`h-1 rounded-full ${step.number <= currentStep ? 'bg-[#7482A4]' : 'bg-[#38323F]/10'}`} />)}
          </div>
        </div>
      </header>
    </>
  )
}