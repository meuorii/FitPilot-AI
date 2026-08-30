import { Activity, ArrowLeft, ArrowRight, CalendarDays, Dumbbell, Flame, Gauge, PieChart, Sparkles, Target } from 'lucide-react'
import type { ActivityLevel, FitnessExperience, PrimaryGoal, Profile } from '../../services/types/onboarding'

interface PlanStepProps {
  profile: Profile
  onBack: () => void
  onFinish: () => void
}

const goalContent: Record<PrimaryGoal, { label: string; description: string }> = {
  lose_weight: { label: 'Lose Weight', description: 'Reduce overall body weight with a sustainable, guided plan.' },
  lose_fat: { label: 'Lose Body Fat', description: 'Reduce body fat while maintaining strength and muscle.' },
  maintain: { label: 'Maintain Weight', description: 'Maintain your weight while building consistent fitness habits.' },
  gain_muscle: { label: 'Gain Muscle', description: 'Build strength and muscle with a controlled nutrition plan.' },
}

const activityLabels: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary',
  lightly_active: 'Lightly Active',
  moderately_active: 'Moderately Active',
  very_active: 'Very Active',
}

const experienceLabels: Record<FitnessExperience, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

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

  return (
    <section className="mx-auto w-full max-w-[980px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10 xl:px-14">
      <span className="inline-flex rounded-lg bg-[#7482A4]/[0.12] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.09em] text-[#7482A4]">Step 4 of 4</span>
      <h1 className="mt-4 text-[clamp(2rem,4vw,3.15rem)] font-bold leading-[1.08] tracking-[-0.045em] text-[#38323F]">Your plan is ready <span aria-hidden="true">🎉</span></h1>
      <p className="mt-3 max-w-[700px] text-sm leading-6 text-[#6A6470] sm:text-base">Built around your goal, current profile, and activity level. Here&apos;s your starting plan.</p>

      <div className="mt-6 rounded-2xl border border-[#7482A4]/[0.22] bg-white p-5 shadow-[0_12px_32px_rgba(56,50,63,0.06)] sm:p-6">
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.07em] text-[#7482A4]">
          <span className="grid size-9 place-items-center rounded-full bg-[#7482A4]/[0.12]"><Target size={19} aria-hidden="true" /></span>Your goal
        </div>
        <div className="mt-5 grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="flex items-center gap-5">
            <div>
              <p className="text-3xl font-bold tracking-[-0.04em] text-[#38323F] sm:text-4xl">{valueFormatter.format(profile.current_weight_kg)} <span className="text-lg">kg</span></p>
              <p className="mt-1 text-sm text-[#6A6470]">Current weight</p>
            </div>
            <ArrowRight className="shrink-0 text-[#7482A4]" size={28} aria-hidden="true" />
            <div>
              <p className="text-3xl font-bold tracking-[-0.04em] text-[#38323F] sm:text-4xl">{valueFormatter.format(profile.target_weight_kg)} <span className="text-lg">kg</span></p>
              <p className="mt-1 text-sm text-[#6A6470]">Target weight</p>
            </div>
          </div>
          <span className="hidden h-24 w-px bg-[#7482A4]/20 md:block" aria-hidden="true" />
          <div className="flex items-center gap-4 border-t border-[#7482A4]/[0.15] pt-5 md:border-0 md:pt-0">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[#7482A4]/[0.12] text-[#7482A4]"><Target size={25} aria-hidden="true" /></span>
            <div>
              <p className="text-lg font-bold text-[#38323F]">{goal.label}</p>
              <p className="mt-1 text-sm leading-5 text-[#6A6470]">{goal.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[#7482A4]/[0.22] bg-white p-5 shadow-[0_10px_28px_rgba(56,50,63,0.05)] sm:p-6">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#7482A4]/[0.12] text-[#7482A4]"><Flame size={23} aria-hidden="true" /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.06em] text-[#7482A4]">Daily calorie target</p>
              <p className="mt-4 text-3xl font-bold tracking-[-0.04em] text-[#38323F] sm:text-4xl">{wholeNumberFormatter.format(profile.daily_calories)} <span className="text-lg">kcal</span></p>
              <p className="mt-3 text-sm leading-5 text-[#6A6470]">Your estimated daily intake to support your {goal.label.toLowerCase()} goal.</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-[#7482A4]/[0.22] bg-white p-5 shadow-[0_10px_28px_rgba(56,50,63,0.05)] sm:p-6">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#7482A4]/[0.12] text-[#7482A4]"><Dumbbell size={23} aria-hidden="true" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.06em] text-[#7482A4]">Weekly training</p>
              <p className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[#38323F]">{profile.workout_days_per_week} {profile.workout_days_per_week === 1 ? 'day' : 'days'} / week</p>
              <div className="mt-4 space-y-2 border-t border-[#7482A4]/[0.15] pt-4 text-sm text-[#5F5964]">
                <p className="flex items-center gap-2.5"><Gauge size={17} className="text-[#7482A4]" aria-hidden="true" />{experienceLabels[profile.fitness_experience]} experience</p>
                <p className="flex items-center gap-2.5"><Activity size={17} className="text-[#7482A4]" aria-hidden="true" />{activityLabels[profile.activity_level]} lifestyle</p>
              </div>
            </div>
          </div>
        </article>
      </div>

      <article className="mt-4 rounded-2xl border border-[#7482A4]/[0.22] bg-white p-5 shadow-[0_10px_28px_rgba(56,50,63,0.05)] sm:p-6">
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.06em] text-[#7482A4]">
          <span className="grid size-9 place-items-center rounded-full bg-[#7482A4]/[0.12]"><PieChart size={19} aria-hidden="true" /></span>Daily macros
        </div>
        <div className="mt-5 grid gap-6 sm:grid-cols-3">
          <MacroMetric label="Protein" grams={profile.protein_grams} percentage={proteinPercentage} />
          <MacroMetric label="Carbohydrates" grams={profile.carbs_grams} percentage={carbsPercentage} />
          <MacroMetric label="Fat" grams={profile.fat_grams} percentage={fatPercentage} />
        </div>
      </article>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#7482A4]/[0.22] bg-[#7482A4]/[0.08] px-4 py-3 text-sm leading-5 text-[#5F5964]">
        <Sparkles className="mt-0.5 size-[18px] shrink-0 text-[#7482A4]" aria-hidden="true" />
        <p>These targets are your starting point. FitPilot can adjust them as your progress and activity change.</p>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#7482A4]/[0.15] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#7482A4]/[0.45] bg-white px-6 text-sm font-bold text-[#38323F] transition hover:border-[#7482A4] hover:bg-[#7482A4]/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7482A4]/20">
          <ArrowLeft size={18} aria-hidden="true" />Back
        </button>
        <button type="button" onClick={onFinish} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#7482A4] px-8 text-sm font-bold text-white shadow-[0_12px_28px_rgba(116,130,164,0.24)] transition hover:-translate-y-0.5 hover:bg-[#657493] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7482A4]/25 active:translate-y-0 sm:min-w-[230px]">
          <CalendarDays size={18} aria-hidden="true" />Start My Journey<ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}

interface MacroMetricProps {
  label: string
  grams: number
  percentage: number
}

function MacroMetric({ label, grams, percentage }: MacroMetricProps) {
  const progress = Math.min(100, Math.max(0, percentage))

  return (
    <div className="sm:[&:not(:last-child)]:border-r sm:[&:not(:last-child)]:border-[#7482A4]/[0.15] sm:[&:not(:last-child)]:pr-6">
      <p className="text-sm font-semibold text-[#4F4954]">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-[-0.035em] text-[#38323F]">{wholeNumberFormatter.format(grams)} g</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#7482A4]/[0.15]" aria-hidden="true">
        <span className="block h-full rounded-full bg-[#7482A4]" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-2 text-xs text-[#6A6470]">{percentage}% of calories</p>
    </div>
  )
}