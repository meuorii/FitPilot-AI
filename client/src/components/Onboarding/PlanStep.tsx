import { Activity, ArrowLeft, ArrowRight, CalendarDays, Flame, Gauge, PieChart, Target } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ActivityLevel, FitnessExperience, PrimaryGoal, Profile } from '../../services/types/onboarding'

interface PlanStepProps { profile: Profile; onBack: () => void; onFinish: () => void }
const goalContent: Record<PrimaryGoal, { label: string; description: string }> = { lose_weight: { label: 'Lose Weight', description: 'Reduce overall body weight with a sustainable, guided plan.' }, lose_fat: { label: 'Lose Body Fat', description: 'Reduce body fat while maintaining strength and muscle.' }, maintain: { label: 'Maintain Weight', description: 'Maintain your weight while building consistent fitness habits.' }, gain_muscle: { label: 'Gain Muscle', description: 'Build strength and muscle with a controlled nutrition plan.' } }
const activityLabels: Record<ActivityLevel, string> = { sedentary: 'Sedentary', lightly_active: 'Lightly active', moderately_active: 'Moderately active', very_active: 'Very active' }
const experienceLabels: Record<FitnessExperience, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }
const valueFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 })
const wholeNumberFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })

function macroPercentage(grams: number, caloriesPerGram: number, dailyCalories: number) {
  if (dailyCalories <= 0) return 0
  return Math.max(0, Math.round(((grams * caloriesPerGram) / dailyCalories) * 100))
}

export default function PlanStep({ profile, onBack, onFinish }: PlanStepProps) {
  const goal = goalContent[profile.primary_goal]
  const proteinPercentage = macroPercentage(profile.protein_grams, 4, profile.daily_calories)
  const carbsPercentage = macroPercentage(profile.carbs_grams, 4, profile.daily_calories)
  const fatPercentage = macroPercentage(profile.fat_grams, 9, profile.daily_calories)
  const weightDifference = profile.target_weight_kg - profile.current_weight_kg
  const weightChangeLabel = Math.abs(weightDifference) < 0.05 ? 'Maintain your current weight' : `${weightDifference > 0 ? 'Gain' : 'Lose'} ${valueFormatter.format(Math.abs(weightDifference))} kg`

  return (
    <section className="mx-auto w-full max-w-[1040px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12 xl:px-14">
      <header className="max-w-[760px]">
        <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.17em] text-[#7482A4]"><span className="h-px w-8 bg-[#7482A4]" aria-hidden="true" />Step 04 · Plan</div>
        <h1 className="mt-5 text-[clamp(2.5rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-[#38323F]">Your starting plan.</h1>
        <p className="mt-4 max-w-[680px] text-base leading-7 text-[#625C67]">Review the targets calculated from your profile. These numbers are your baseline and can change as your progress is recorded.</p>
      </header>

      <article className="mt-8 overflow-hidden rounded-[20px] border border-[#38323F]/10 bg-white">
        <div className="grid md:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)]">
          <div className="p-5 sm:p-7">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-[#7482A4]"><Target size={16} aria-hidden="true" />Weight target</div>
            <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-end gap-3 sm:gap-6">
              <div><p className="text-[clamp(2rem,5vw,3rem)] font-semibold leading-none tracking-[-0.05em] text-[#38323F]">{valueFormatter.format(profile.current_weight_kg)}<span className="ml-1.5 text-base font-medium tracking-normal text-[#77717C]">kg</span></p><p className="mt-2 text-xs font-medium text-[#77717C]">Current</p></div>
              <ArrowRight className="mb-6 text-[#7482A4]" size={22} aria-hidden="true" />
              <div><p className="text-[clamp(2rem,5vw,3rem)] font-semibold leading-none tracking-[-0.05em] text-[#38323F]">{valueFormatter.format(profile.target_weight_kg)}<span className="ml-1.5 text-base font-medium tracking-normal text-[#77717C]">kg</span></p><p className="mt-2 text-xs font-medium text-[#77717C]">Target</p></div>
            </div>
            <p className="mt-6 border-t border-[#38323F]/10 pt-4 text-sm font-semibold text-[#38323F]">{weightChangeLabel}</p>
          </div>
          <div className="border-t border-[#38323F]/10 bg-[#F5F3F6] p-5 sm:p-7 md:border-l md:border-t-0">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#7482A4]">Primary goal</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.035em] text-[#38323F]">{goal.label}</h2>
            <p className="mt-2 text-sm leading-6 text-[#625C67]">{goal.description}</p>
          </div>
        </div>
      </article>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <PlanMetric icon={<Flame size={19} aria-hidden="true" />} label="Daily target" value={`${wholeNumberFormatter.format(profile.daily_calories)} kcal`} detail="Recommended calorie intake" />
        <PlanMetric icon={<CalendarDays size={19} aria-hidden="true" />} label="Weekly training" value={`${profile.workout_days_per_week} ${profile.workout_days_per_week === 1 ? 'day' : 'days'}`} detail="Planned workout frequency" />
        <PlanMetric icon={<Gauge size={19} aria-hidden="true" />} label="Training level" value={experienceLabels[profile.fitness_experience]} detail={`${activityLabels[profile.activity_level]} lifestyle`} className="sm:col-span-2 xl:col-span-1" />
      </div>

      <article className="mt-4 rounded-[20px] border border-[#38323F]/10 bg-white p-5 sm:p-7">
        <div className="flex flex-col gap-3 border-b border-[#38323F]/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-[#7482A4]"><PieChart size={16} aria-hidden="true" />Daily macros</div><h2 className="mt-3 text-xl font-semibold tracking-[-0.025em] text-[#38323F]">Nutrition split</h2></div>
          <p className="text-xs text-[#77717C]">Based on {wholeNumberFormatter.format(profile.daily_calories)} kcal per day</p>
        </div>
        <div className="grid gap-0 sm:grid-cols-3">
          <MacroMetric label="Protein" grams={profile.protein_grams} percentage={proteinPercentage} />
          <MacroMetric label="Carbohydrates" grams={profile.carbs_grams} percentage={carbsPercentage} />
          <MacroMetric label="Fat" grams={profile.fat_grams} percentage={fatPercentage} />
        </div>
      </article>

      <div className="mt-5 flex items-start gap-3 border-l-2 border-[#7482A4] py-1 pl-4 text-sm leading-6 text-[#625C67]"><Activity className="mt-0.5 size-[18px] shrink-0 text-[#7482A4]" aria-hidden="true" /><p>Targets will remain visible in your dashboard and can be adjusted when your profile or activity changes.</p></div>

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#38323F]/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] border border-[#38323F]/15 bg-white px-6 text-sm font-semibold text-[#38323F] transition-colors hover:border-[#7482A4] hover:bg-[#7482A4]/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7482A4]/20"><ArrowLeft size={18} aria-hidden="true" />Back</button>
        <button type="button" onClick={onFinish} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-[12px] bg-[#7482A4] px-8 text-sm font-semibold text-white transition-colors hover:bg-[#657493] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7482A4]/25 sm:min-w-[220px]">Continue to FitPilot<ArrowRight size={18} aria-hidden="true" /></button>
      </div>
    </section>
  )
}

interface PlanMetricProps { icon: ReactNode; label: string; value: string; detail: string; className?: string }

function PlanMetric({ icon, label, value, detail, className = '' }: PlanMetricProps) {
  return (
    <article className={`rounded-[18px] border border-[#38323F]/10 bg-white p-5 sm:p-6 ${className}`}>
      <div className="flex items-center gap-2 text-[#7482A4]">{icon}<p className="text-xs font-bold uppercase tracking-[0.11em]">{label}</p></div>
      <p className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-[#38323F]">{value}</p>
      <p className="mt-1.5 text-xs leading-5 text-[#77717C]">{detail}</p>
    </article>
  )
}

interface MacroMetricProps { label: string; grams: number; percentage: number }

function MacroMetric({ label, grams, percentage }: MacroMetricProps) {
  const progress = Math.min(100, Math.max(0, percentage))
  return (
    <div className="border-b border-[#38323F]/10 py-5 last:border-b-0 sm:border-b-0 sm:py-6 sm:[&:not(:last-child)]:border-r sm:[&:not(:last-child)]:pr-6 sm:[&:not(:first-child)]:pl-6">
      <div className="flex items-baseline justify-between gap-3"><p className="text-sm font-semibold text-[#38323F]">{label}</p><p className="text-xs text-[#77717C]">{percentage}%</p></div>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-[#38323F]">{wholeNumberFormatter.format(grams)} <span className="text-sm font-medium tracking-normal text-[#77717C]">g</span></p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#7482A4]/15" aria-hidden="true"><span className="block h-full rounded-full bg-[#7482A4]" style={{ width: `${progress}%` }} /></div>
    </div>
  )
}