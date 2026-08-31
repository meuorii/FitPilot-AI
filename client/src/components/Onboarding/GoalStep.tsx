import { ArrowLeft, ArrowRight, Check, CircleAlert, LoaderCircle } from 'lucide-react'
import type { GoalOption, PrimaryGoal } from '../../services/types/onboarding'

interface GoalStepProps { goals: GoalOption[]; selectedGoal: GoalOption | null; isLoading: boolean; error: string | null; onSelect: (goal: GoalOption) => void; onBack: () => void; onContinue: () => void }
const goalImages: Record<PrimaryGoal, string> = { lose_weight: '/onboarding/your-goals/lose-weight.png', lose_fat: '/onboarding/your-goals/lose-fat.png', maintain: '/onboarding/your-goals/maintain.png', gain_muscle: '/onboarding/your-goals/gain-muscle.png' }
const goalDescriptions: Record<PrimaryGoal, string> = { lose_weight: 'Reduce overall weight with a sustainable calorie deficit.', lose_fat: 'Lower body fat while preserving strength and lean mass.', maintain: 'Keep your weight steady and build consistent habits.', gain_muscle: 'Support strength and muscle growth with a controlled surplus.' }
const numberFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 })
const calorieFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })

export default function GoalStep({ goals, selectedGoal, isLoading, error, onSelect, onBack, onContinue }: GoalStepProps) {
  const recommendedGoal = goals.find((goal) => goal.is_recommended)

  return (
    <section className="mx-auto w-full max-w-[1060px] px-5 py-10 sm:px-8 lg:px-10 lg:py-12 xl:px-14">
      <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.17em] text-[#7482A4]"><span className="h-px w-8 bg-[#7482A4]" aria-hidden="true" />Step 03 · Goal</div>
      <h1 className="mt-5 text-[clamp(2.25rem,4vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-[#38323F]">Choose your direction.</h1>
      <p className="mt-3 max-w-[650px] text-sm leading-6 text-[#6B6570] sm:text-base">Select one primary goal. Your calories, macros, and training target will follow this choice.</p>

      {recommendedGoal && <div className="mt-6 border-l-2 border-[#7482A4] py-1 pl-4 text-sm leading-6 text-[#625C67]"><span className="font-semibold text-[#38323F]">Recommended: {recommendedGoal.label}.</span>{' '}{recommendedGoal.recommendation_reason}</div>}

      {error && <div className="mt-6 flex items-start gap-3 rounded-[12px] border border-[#B96F78]/30 bg-[#B96F78]/[0.07] px-4 py-3 text-sm text-[#844E57]" role="alert"><CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span>{error}</span></div>}

      <div className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-2" role="radiogroup" aria-label="Primary fitness goal">
        {goals.map((goal) => {
          const selected = selectedGoal?.goal === goal.goal
          return (
            <button key={goal.goal} type="button" role="radio" aria-checked={selected} onClick={() => onSelect(goal)} className={`relative min-h-[218px] rounded-[16px] border p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7482A4]/15 ${selected ? 'border-[#7482A4] bg-[#7482A4]/[0.07]' : 'border-[#38323F]/10 bg-white hover:border-[#7482A4]/60'}`}>
              <span className="flex items-start gap-4 pr-8">
                <span className="grid size-[84px] shrink-0 place-items-center overflow-hidden rounded-[12px] border border-[#38323F]/10 bg-[#F5F3F6]"><img src={goalImages[goal.goal]} alt={`Rocco representing ${goal.label}`} className="size-full select-none object-contain p-1" draggable={false} /></span>
                <span className="min-w-0 pt-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-semibold tracking-[-0.025em] text-[#38323F]">{goal.label}</span>
                    {goal.is_recommended && <span className="rounded-[5px] border border-[#7482A4]/30 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#657493]">Recommended</span>}
                  </span>
                  <span className="mt-2 block text-sm leading-5 text-[#77717C]">{goalDescriptions[goal.goal]}</span>
                </span>
              </span>
              <span className="mt-5 flex items-end justify-between gap-4 border-t border-[#38323F]/10 pt-4">
                <span>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8A8490]">{goal.goal === 'maintain' ? 'Maintain around' : 'Suggested target'}</span>
                  <span className="mt-1 block text-base font-semibold text-[#38323F]">{numberFormatter.format(goal.recommended_target_weight_kg)} kg</span>
                </span>
                <span className={`grid size-7 place-items-center rounded-full border ${selected ? 'border-[#7482A4] bg-[#7482A4] text-white' : 'border-[#38323F]/20 bg-white text-transparent'}`} aria-hidden="true"><Check size={14} strokeWidth={2.8} /></span>
              </span>
            </button>
          )
        })}
      </div>

      {selectedGoal && (
        <section className="mt-5 rounded-[16px] border border-[#38323F]/10 bg-white" aria-labelledby="selection-summary-heading">
          <div className="grid gap-0 sm:grid-cols-[1.4fr_1fr_1fr]">
            <div className="p-5"><p id="selection-summary-heading" className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8A8490]">Selected goal</p><p className="mt-2 text-base font-semibold text-[#38323F]">{selectedGoal.label}</p></div>
            <div className="border-t border-[#38323F]/10 p-5 sm:border-l sm:border-t-0"><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8A8490]">Target weight</p><p className="mt-2 text-base font-semibold text-[#38323F]">{numberFormatter.format(selectedGoal.recommended_target_weight_kg)} kg</p></div>
            <div className="border-t border-[#38323F]/10 p-5 sm:border-l sm:border-t-0"><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8A8490]">Daily calories</p><p className="mt-2 text-base font-semibold text-[#38323F]">{calorieFormatter.format(selectedGoal.metrics.daily_calories)} kcal</p></div>
          </div>
        </section>
      )}

      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#38323F]/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} disabled={isLoading} className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-[11px] border border-[#38323F]/15 bg-transparent px-6 text-sm font-semibold text-[#38323F] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7482A4]/15 disabled:cursor-not-allowed disabled:opacity-50"><ArrowLeft size={17} aria-hidden="true" />Back</button>
        <button type="button" onClick={onContinue} disabled={!selectedGoal || isLoading} className="inline-flex min-h-[50px] items-center justify-center gap-3 rounded-[11px] bg-[#7482A4] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#657493] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7482A4]/20 disabled:cursor-not-allowed disabled:opacity-[0.45] sm:min-w-[190px]">
          {isLoading ? <><LoaderCircle className="animate-spin" size={17} aria-hidden="true" />Building plan</> : <><ArrowRight size={17} aria-hidden="true" />Continue</>}
        </button>
      </div>
    </section>
  )
}