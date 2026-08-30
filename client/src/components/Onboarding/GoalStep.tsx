import { ArrowLeft, ArrowRight, Check, CircleAlert, Compass, LoaderCircle, Sparkles } from 'lucide-react'
import type { GoalOption, PrimaryGoal } from '../../services/types/onboarding'

interface GoalStepProps {
  goals: GoalOption[]
  selectedGoal: GoalOption | null
  isLoading: boolean
  error: string | null
  onSelect: (goal: GoalOption) => void
  onBack: () => void
  onContinue: () => void
}

const goalImages: Record<PrimaryGoal, string> = {
  lose_weight: '/onboarding/your-goals/lose-weight.png',
  lose_fat: '/onboarding/your-goals/lose-fat.png',
  maintain: '/onboarding/your-goals/maintain.png',
  gain_muscle: '/onboarding/your-goals/gain-muscle.png',
}

const goalDescriptions: Record<PrimaryGoal, string> = {
  lose_weight: 'Reduce overall body weight through a sustainable calorie deficit.',
  lose_fat: 'Reduce body fat while prioritizing strength and muscle retention.',
  maintain: 'Stay around your current weight while building consistent habits.',
  gain_muscle: 'Build strength and muscle with a controlled calorie surplus.',
}

const numberFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 })
const calorieFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })

export default function GoalStep({ goals, selectedGoal, isLoading, error, onSelect, onBack, onContinue }: GoalStepProps) {
  const recommendedGoal = goals.find((goal) => goal.is_recommended)

  return (
    <section className="mx-auto w-full max-w-[980px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10 xl:px-14">
      <span className="inline-flex rounded-lg bg-[#7482A4]/[0.12] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.09em] text-[#7482A4]">Step 3 of 4</span>
      <h1 className="mt-4 text-[clamp(2rem,4vw,3.15rem)] font-bold leading-[1.08] tracking-[-0.045em] text-[#38323F]">What&apos;s your main goal?</h1>
      <p className="mt-3 max-w-[700px] text-sm leading-6 text-[#6A6470] sm:text-base">Choose the goal that matters most to you. We&apos;ve highlighted the option that best matches your current profile.</p>

      {recommendedGoal && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#7482A4]/20 bg-white/80 px-4 py-3 text-sm leading-5 text-[#5F5964]">
          <Sparkles className="mt-0.5 size-[18px] shrink-0 text-[#7482A4]" aria-hidden="true" />
          <p>Based on your current profile, Rocco recommends <strong className="font-semibold text-[#38323F]">{recommendedGoal.label}</strong>. {recommendedGoal.recommendation_reason}</p>
        </div>
      )}

      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#B96F78]/25 bg-[#B96F78]/[0.08] px-4 py-3 text-sm text-[#804952]" role="alert">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" role="radiogroup" aria-label="Primary fitness goal">
        {goals.map((goal) => {
          const selected = selectedGoal?.goal === goal.goal
          return (
            <button key={goal.goal} type="button" role="radio" aria-checked={selected} onClick={() => onSelect(goal)} className={`relative flex min-h-[235px] flex-col rounded-2xl border p-5 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7482A4]/20 ${selected ? 'border-[#7482A4] bg-[#7482A4]/[0.08] shadow-[0_15px_34px_rgba(116,130,164,0.15)]' : goal.is_recommended ? 'border-[#7482A4]/[0.55] bg-white shadow-[0_10px_26px_rgba(116,130,164,0.08)] hover:border-[#7482A4]' : 'border-[#7482A4]/[0.22] bg-white hover:-translate-y-0.5 hover:border-[#7482A4]/[0.55] hover:shadow-[0_12px_28px_rgba(56,50,63,0.07)]'}`}>
              {selected && <span className="absolute right-4 top-4 grid size-7 place-items-center rounded-full bg-[#7482A4] text-white"><Check size={15} strokeWidth={3} aria-hidden="true" /></span>}
              <span className="flex items-start gap-4 pr-7">
                <span className="grid size-[74px] shrink-0 place-items-center overflow-hidden rounded-xl border border-[#7482A4]/[0.18] bg-[#F5F3F6]">
                  <img src={goalImages[goal.goal]} alt={`Rocco representing ${goal.label}`} className="size-full select-none object-contain p-1" draggable={false} />
                </span>
                <span className="min-w-0 pt-1">
                  <span className="block text-lg font-bold tracking-[-0.025em] text-[#38323F]">{goal.label}</span>
                  {goal.is_recommended && <span className="mt-1 inline-flex rounded-md bg-[#7482A4]/[0.15] px-2 py-1 text-[11px] font-bold text-[#657493]">Recommended for you</span>}
                  <span className="mt-2 block text-sm leading-5 text-[#67616C]">{goalDescriptions[goal.goal]}</span>
                </span>
              </span>
              <span className="mt-auto block border-t border-[#7482A4]/[0.16] pt-4 text-sm font-semibold text-[#4F4954]">
                {goal.goal === 'maintain' ? 'Maintain around' : 'Suggested target'}<span className="mx-2 text-[#8D8791]">·</span>{numberFormatter.format(goal.recommended_target_weight_kg)} kg
              </span>
              {goal.is_recommended && <span className="mt-3 flex items-start gap-2 text-xs leading-4 text-[#657493]"><Sparkles className="mt-px size-3.5 shrink-0" aria-hidden="true" />{goal.recommendation_reason}</span>}
            </button>
          )
        })}
      </div>

      {selectedGoal && (
        <div className="mt-5 rounded-2xl border border-[#7482A4]/25 bg-white p-5 shadow-[0_10px_28px_rgba(116,130,164,0.07)]">
          <div className="grid gap-4 sm:grid-cols-[auto_1fr_1fr] sm:items-center">
            <div className="flex items-center gap-3 sm:pr-5">
              <span className="grid size-10 place-items-center rounded-full bg-[#7482A4]/[0.12] text-[#7482A4]"><Compass size={20} aria-hidden="true" /></span>
              <p className="font-bold text-[#38323F]">Your direction</p>
            </div>
            <div className="border-[#7482A4]/[0.15] sm:border-l sm:pl-5">
              <p className="text-xs text-[#746D79]">Target weight</p>
              <p className="mt-1 text-lg font-bold text-[#38323F]">{numberFormatter.format(selectedGoal.recommended_target_weight_kg)} kg</p>
            </div>
            <div className="border-[#7482A4]/[0.15] sm:border-l sm:pl-5">
              <p className="text-xs text-[#746D79]">Daily target</p>
              <p className="mt-1 text-lg font-bold text-[#38323F]">~{calorieFormatter.format(selectedGoal.metrics.daily_calories)} kcal</p>
            </div>
          </div>
          <p className="mt-4 border-t border-[#7482A4]/[0.15] pt-4 text-sm leading-5 text-[#67616C]">We&apos;ll turn this goal into your calorie, macro, and training targets in the next step.</p>
        </div>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#7482A4]/[0.15] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} disabled={isLoading} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#7482A4]/[0.45] bg-white px-6 text-sm font-bold text-[#38323F] transition hover:border-[#7482A4] hover:bg-[#7482A4]/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7482A4]/20 disabled:cursor-not-allowed disabled:opacity-50">
          <ArrowLeft size={18} aria-hidden="true" />Back
        </button>
        <button type="button" onClick={onContinue} disabled={!selectedGoal || isLoading} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#7482A4] px-8 text-sm font-bold text-white shadow-[0_12px_28px_rgba(116,130,164,0.24)] transition hover:bg-[#657493] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7482A4]/25 disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-45 sm:min-w-[190px]">
          {isLoading ? (<><LoaderCircle className="animate-spin" size={18} aria-hidden="true" />Building plan…</>) : (<>Continue<ArrowRight size={18} aria-hidden="true" /></>)}
        </button>
      </div>
    </section>
  )
}