import { Check, ClipboardCheck, Hand, Target, UserRound } from 'lucide-react';

interface OnboardingSidebarProps { currentStep: 1 | 2 | 3 | 4; }

const steps = [
  { number: 1, label: 'Welcome', icon: Hand },
  { number: 2, label: 'About You', icon: UserRound },
  { number: 3, label: 'Your Goal', icon: Target },
  { number: 4, label: 'Your Plan', icon: ClipboardCheck },
] as const;

const sidebarImages: Record<OnboardingSidebarProps['currentStep'], string> = {
  1: '/onboarding/onboarding-left/step1.png',
  2: '/onboarding/onboarding-left/step2.png',
  3: '/onboarding/onboarding-left/step3.png',
  4: '/onboarding/onboarding-left/step4.png',
};

export default function OnboardingSidebar({ currentStep }: OnboardingSidebarProps) {
  const currentLabel = steps[currentStep - 1].label;

  return (
    <>
      <aside className="relative hidden min-h-dvh overflow-hidden border-r border-[#7482A4]/20 bg-white px-8 py-9 lg:flex lg:flex-col xl:px-11 xl:py-11">
        <div className="relative z-10">
          <p className="text-[clamp(1.75rem,2.4vw,2.35rem)] font-bold leading-[1.12] tracking-[-0.04em] text-[#38323F]">Your Journey<br />Starts Here</p>
          <p className="mt-3 max-w-[260px] text-[15px] leading-6 text-[#6E6873] xl:text-base">Let&apos;s build a fitness plan that&apos;s made for you.</p>
        </div>

        <ol className="relative z-10 mt-8 space-y-0 xl:mt-9" aria-label="Onboarding progress">
          {steps.map((step, index) => {
            const isComplete = step.number < currentStep;
            const isCurrent = step.number === currentStep;
            const Icon = step.icon;

            return (
              <li key={step.number} className="relative flex min-h-[74px] items-start gap-4">
                {index < steps.length - 1 && <span className={`absolute left-[23px] top-12 h-[26px] w-px ${step.number < currentStep ? 'bg-[#7482A4]' : 'bg-[#7482A4]/30'}`} aria-hidden="true" />}
                <span className={`grid size-12 shrink-0 place-items-center rounded-full border transition-colors ${isCurrent ? 'border-[#7482A4] bg-[#7482A4] text-white shadow-[0_10px_24px_rgba(116,130,164,0.25)]' : isComplete ? 'border-[#7482A4]/[0.45] bg-white text-[#38323F]' : 'border-[#7482A4]/[0.35] bg-white text-[#7482A4]'}`} aria-hidden="true">
                  {isComplete ? <Check size={21} strokeWidth={2.5} /> : <Icon size={21} strokeWidth={1.8} />}
                </span>
                <span className="min-w-0 pt-0.5">
                  {isCurrent && <span className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#7482A4]">Step {step.number} of 4</span>}
                  <span className={`mt-0.5 block text-[15px] leading-5 ${isCurrent ? 'font-bold text-[#38323F]' : 'font-medium text-[#67616C]'}`}>
                    {!isCurrent && <span className="mr-2 text-sm">{step.number}</span>}
                    {step.label}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>

        <div className="pointer-events-none relative z-0 mt-auto flex min-h-[245px] flex-1 items-end justify-center pt-3 xl:min-h-[285px]">
          <div className="absolute inset-x-4 bottom-2 h-20 rounded-full bg-[#7482A4]/10 blur-3xl" aria-hidden="true" />
          <img key={currentStep} src={sidebarImages[currentStep]} alt={`Rocco guiding you through ${currentLabel}`} className="relative max-h-[36vh] w-full max-w-[310px] select-none object-contain object-bottom" draggable={false} />
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-[#7482A4]/[0.15] bg-[#F5F3F6]/[0.95] px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="truncate text-sm font-bold text-[#38323F]">{currentLabel}</p>
              <p className="shrink-0 text-[11px] font-bold uppercase tracking-[0.08em] text-[#7482A4]">Step {currentStep} of 4</p>
            </div>
            <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
              {steps.map((step) => (
                <span key={step.number} className={`h-1.5 rounded-full ${step.number <= currentStep ? 'bg-[#7482A4]' : 'bg-[#7482A4]/20'}`} />
              ))}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}