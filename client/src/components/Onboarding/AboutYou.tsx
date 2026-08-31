import { useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Check, CircleAlert, LoaderCircle, Mars, Venus } from 'lucide-react'

import type { ActivityLevel, Gender } from '../../services/types/onboarding'

export interface AboutYouFormData { age: string; gender: Gender | ''; height_cm: string; weight_kg: string; activity_level: ActivityLevel | '' }

interface AboutYouStepProps { formData: AboutYouFormData; isLoading: boolean; error: string | null; onChange: <K extends keyof AboutYouFormData>(field: K, value: AboutYouFormData[K]) => void; onBack: () => void; onContinue: () => void }

const activityOptions: Array<{ value: ActivityLevel; label: string; description: string; frequency: string; image: string }> = [
  { value: 'sedentary', label: 'Sedentary', description: 'Mostly seated with little planned exercise.', frequency: '0–1 sessions weekly', image: '/onboarding/about you/sedentary.png' },
  { value: 'lightly_active', label: 'Lightly active', description: 'Regular movement and a few easy sessions.', frequency: '1–3 sessions weekly', image: '/onboarding/about you/lightly-active.png' },
  { value: 'moderately_active', label: 'Moderately active', description: 'Consistent exercise across most weeks.', frequency: '3–5 sessions weekly', image: '/onboarding/about you/moderately_active.png' },
  { value: 'very_active', label: 'Very active', description: 'Frequent training or a physical daily routine.', frequency: '6+ sessions weekly', image: '/onboarding/about you/very_active.png' },
]

const numericRules = { age: { min: 13, max: 100, label: 'Age' }, height_cm: { min: 100, max: 250, label: 'Height' }, weight_kg: { min: 30, max: 350, label: 'Weight' } } as const
type NumericField = keyof typeof numericRules

function validateNumericField(field: NumericField, value: string) {
  const rule = numericRules[field]
  const parsed = Number(value)
  if (!value.trim()) return `${rule.label} is required.`
  if (!Number.isFinite(parsed) || parsed < rule.min || parsed > rule.max) return `${rule.label} must be between ${rule.min} and ${rule.max}.`
  return ''
}

export default function AboutYouStep({ formData, isLoading, error, onChange, onBack, onContinue }: AboutYouStepProps) {
  const [touched, setTouched] = useState<Partial<Record<NumericField, boolean>>>({})

  const fieldErrors = useMemo(() => ({
    age: validateNumericField('age', formData.age),
    height_cm: validateNumericField('height_cm', formData.height_cm),
    weight_kg: validateNumericField('weight_kg', formData.weight_kg),
  }), [formData.age, formData.height_cm, formData.weight_kg])

  const isValid = !fieldErrors.age && !fieldErrors.height_cm && !fieldErrors.weight_kg && Boolean(formData.gender) && Boolean(formData.activity_level)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTouched({ age: true, height_cm: true, weight_kg: true })
    if (isValid) onContinue()
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-[1060px] px-5 py-10 sm:px-8 lg:px-10 lg:py-12 xl:px-14" noValidate>
      <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.17em] text-[#7482A4]"><span className="h-px w-8 bg-[#7482A4]" aria-hidden="true" />Step 02 · Profile</div>
      <h1 className="mt-5 text-[clamp(2.25rem,4vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-[#38323F]">Set your baseline.</h1>
      <p className="mt-3 max-w-[650px] text-sm leading-6 text-[#6B6570] sm:text-base">Enter your current details so we can estimate energy needs accurately.</p>

      {error && <div className="mt-6 flex items-start gap-3 rounded-[12px] border border-[#B96F78]/30 bg-[#B96F78]/[0.07] px-4 py-3 text-sm text-[#844E57]" role="alert"><CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span>{error}</span></div>}

      <section className="mt-7 rounded-[18px] border border-[#38323F]/10 bg-white p-5 sm:p-6" aria-labelledby="body-details-heading">
        <div className="flex items-end justify-between gap-4 border-b border-[#38323F]/10 pb-4">
          <div><h2 id="body-details-heading" className="text-base font-semibold text-[#38323F]">Body details</h2><p className="mt-1 text-xs text-[#77717C]">Use your current measurements.</p></div>
          <span className="text-[11px] font-medium text-[#8A8490]">Metric units</span>
        </div>

        <div className="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
          <NumberField id="age" label="Age" value={formData.age} suffix="years" min={numericRules.age.min} max={numericRules.age.max} error={touched.age ? fieldErrors.age : ''} onChange={(value) => onChange('age', value)} onBlur={() => setTouched((current) => ({ ...current, age: true }))} />
          <NumberField id="height_cm" label="Height" value={formData.height_cm} suffix="cm" min={numericRules.height_cm.min} max={numericRules.height_cm.max} error={touched.height_cm ? fieldErrors.height_cm : ''} onChange={(value) => onChange('height_cm', value)} onBlur={() => setTouched((current) => ({ ...current, height_cm: true }))} />
          <NumberField id="weight_kg" label="Current weight" value={formData.weight_kg} suffix="kg" min={numericRules.weight_kg.min} max={numericRules.weight_kg.max} error={touched.weight_kg ? fieldErrors.weight_kg : ''} onChange={(value) => onChange('weight_kg', value)} onBlur={() => setTouched((current) => ({ ...current, weight_kg: true }))} />

          <fieldset>
            <legend className="mb-2 block text-xs font-semibold text-[#5F5964]">Gender</legend>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Gender">
              {([{ value: 'male' as const, label: 'Male', icon: Mars }, { value: 'female' as const, label: 'Female', icon: Venus }]).map((option) => {
                const selected = formData.gender === option.value
                const Icon = option.icon
                return (
                  <button key={option.value} type="button" role="radio" aria-checked={selected} onClick={() => onChange('gender', option.value)} className={`flex h-[50px] items-center justify-center gap-2 rounded-[10px] border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7482A4]/15 ${selected ? 'border-[#7482A4] bg-[#7482A4] text-white' : 'border-[#38323F]/15 bg-[#F8F7F9] text-[#5F5964] hover:border-[#7482A4]/60'}`}>
                    <Icon size={16} aria-hidden="true" />{option.label}
                  </button>
                )
              })}
            </div>
          </fieldset>
        </div>
      </section>

      <fieldset className="mt-5 rounded-[18px] border border-[#38323F]/10 bg-white p-5 sm:p-6">
        <legend className="sr-only">Weekly activity</legend>
        <div className="border-b border-[#38323F]/10 pb-4">
          <h2 className="text-base font-semibold text-[#38323F]">Weekly activity</h2>
          <p className="mt-1 text-xs leading-5 text-[#77717C]">Choose the option closest to a typical week.</p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" role="radiogroup" aria-label="Activity level">
          {activityOptions.map((option) => {
            const selected = formData.activity_level === option.value
            return (
              <button key={option.value} type="button" role="radio" aria-checked={selected} onClick={() => onChange('activity_level', option.value)} className={`relative flex min-h-[250px] flex-col overflow-hidden rounded-[14px] border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7482A4]/15 ${selected ? 'border-[#7482A4] bg-[#7482A4]/[0.07]' : 'border-[#38323F]/10 bg-[#F8F7F9] hover:border-[#7482A4]/60'}`}>
                <span className="absolute right-3 top-3 grid size-6 place-items-center rounded-full border border-[#38323F]/15 bg-white" aria-hidden="true">{selected && <Check size={13} strokeWidth={2.8} className="text-[#7482A4]" />}</span>
                <img src={option.image} alt={`Rocco representing ${option.label.toLowerCase()}`} className="h-[112px] w-full select-none object-contain" draggable={false} />
                <span className="mt-2 text-sm font-semibold text-[#38323F]">{option.label}</span>
                <span className="mt-1 text-xs leading-[1.45] text-[#77717C]">{option.description}</span>
                <span className={`mt-auto border-t pt-3 text-[11px] font-semibold ${selected ? 'border-[#7482A4]/25 text-[#657493]' : 'border-[#38323F]/10 text-[#77717C]'}`}>{option.frequency}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#38323F]/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} disabled={isLoading} className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-[11px] border border-[#38323F]/15 bg-transparent px-6 text-sm font-semibold text-[#38323F] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7482A4]/15 disabled:cursor-not-allowed disabled:opacity-50"><ArrowLeft size={17} aria-hidden="true" />Back</button>
        <button type="submit" disabled={!isValid || isLoading} className="inline-flex min-h-[50px] items-center justify-center gap-3 rounded-[11px] bg-[#7482A4] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#657493] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7482A4]/20 disabled:cursor-not-allowed disabled:opacity-[0.45] sm:min-w-[190px]">
          {isLoading ? <><LoaderCircle className="animate-spin" size={17} aria-hidden="true" />Calculating</> : <><ArrowRight size={17} aria-hidden="true" />Continue</>}
        </button>
      </div>
    </form>
  )
}

interface NumberFieldProps { id: NumericField; label: string; value: string; suffix: string; min: number; max: number; error: string; onChange: (value: string) => void; onBlur: () => void }

function NumberField({ id, label, value, suffix, min, max, error, onChange, onBlur }: NumberFieldProps) {
  const errorId = `${id}-error`
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-2 block text-xs font-semibold text-[#5F5964]">{label}</span>
      <span className={`flex h-[50px] items-center rounded-[10px] border bg-[#F8F7F9] px-3.5 transition-colors focus-within:bg-white focus-within:ring-4 ${error ? 'border-[#B96F78]/60 focus-within:ring-[#B96F78]/10' : 'border-[#38323F]/15 focus-within:border-[#7482A4] focus-within:ring-[#7482A4]/10'}`}>
        <input id={id} type="number" inputMode="numeric" min={min} max={max} step="1" value={value} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#38323F] outline-none placeholder:font-normal placeholder:text-[#9A949F]" placeholder="Enter value" />
        <span className="ml-2 shrink-0 text-xs font-medium text-[#8A8490]">{suffix}</span>
      </span>
      <span id={errorId} className="mt-1 block min-h-4 text-[11px] text-[#9D5963]" role={error ? 'alert' : undefined}>{error}</span>
    </label>
  )
}