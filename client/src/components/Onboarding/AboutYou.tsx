import { useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, CircleAlert, LoaderCircle, Mars, Venus } from 'lucide-react';
import type { ActivityLevel, Gender } from '../../services/types/onboarding';

export interface AboutYouFormData { age: string; gender: Gender | ''; height_cm: string; weight_kg: string; activity_level: ActivityLevel | ''; }

interface AboutYouStepProps { formData: AboutYouFormData; isLoading: boolean; error: string | null; onChange: <K extends keyof AboutYouFormData>(field: K, value: AboutYouFormData[K]) => void; onBack: () => void; onContinue: () => void; }

const activityOptions: Array<{ value: ActivityLevel; label: string; description: string; frequency: string; image: string; level: number }> = [
  { value: 'sedentary', label: 'Sedentary', description: 'Mostly sitting with little intentional exercise.', frequency: '0–1 workouts / week', image: '/onboarding/about you/sedentary.png', level: 1 },
  { value: 'lightly_active', label: 'Lightly Active', description: 'Some daily movement with a few workouts each week.', frequency: '1–3 workouts / week', image: '/onboarding/about you/lightly-active.png', level: 2 },
  { value: 'moderately_active', label: 'Moderately Active', description: 'Regular exercise and an active weekly routine.', frequency: '3–5 workouts / week', image: '/onboarding/about you/moderately_active.png', level: 3 },
  { value: 'very_active', label: 'Very Active', description: 'Frequent training or a highly active daily lifestyle.', frequency: '6–7+ workouts / week', image: '/onboarding/about you/very_active.png', level: 4 },
];

const numericRules = { age: { min: 13, max: 100, label: 'Age' }, height_cm: { min: 100, max: 250, label: 'Height' }, weight_kg: { min: 30, max: 350, label: 'Weight' } } as const;

type NumericField = keyof typeof numericRules;

function validateNumericField(field: NumericField, value: string) {
  const rule = numericRules[field];
  const parsed = Number(value);
  if (!value.trim()) return `${rule.label} is required.`;
  if (!Number.isFinite(parsed) || parsed < rule.min || parsed > rule.max) return `${rule.label} must be between ${rule.min} and ${rule.max}.`;
  return '';
}

export default function AboutYouStep({ formData, isLoading, error, onChange, onBack, onContinue }: AboutYouStepProps) {
  const [touched, setTouched] = useState<Partial<Record<NumericField, boolean>>>({});
  const fieldErrors = useMemo(() => ({ age: validateNumericField('age', formData.age), height_cm: validateNumericField('height_cm', formData.height_cm), weight_kg: validateNumericField('weight_kg', formData.weight_kg) }), [formData.age, formData.height_cm, formData.weight_kg]);
  const isValid = !fieldErrors.age && !fieldErrors.height_cm && !fieldErrors.weight_kg && Boolean(formData.gender) && Boolean(formData.activity_level);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ age: true, height_cm: true, weight_kg: true });
    if (isValid) onContinue();
  };

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-[980px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10 xl:px-14" noValidate>
      <span className="inline-flex rounded-lg bg-[#7482A4]/[0.12] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.09em] text-[#7482A4]">Step 2 of 4</span>
      <h1 className="mt-4 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.045em] text-[#38323F]">Tell us about you</h1>
      <p className="mt-3 max-w-[680px] text-sm leading-6 text-[#6A6470] sm:text-base">A few quick details help Rocco estimate your daily energy needs and personalize your fitness plan.</p>
      {error && <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#B96F78]/25 bg-[#B96F78]/[0.08] px-4 py-3 text-sm text-[#804952]" role="alert"><CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span>{error}</span></div>}
      <div className="mt-7 grid gap-x-7 gap-y-5 md:grid-cols-2">
        <NumberField id="age" label="Age" value={formData.age} suffix="years" min={numericRules.age.min} max={numericRules.age.max} error={touched.age ? fieldErrors.age : ''} onChange={(value) => onChange('age', value)} onBlur={() => setTouched((current) => ({ ...current, age: true }))} />
        <fieldset>
          <legend className="mb-2 text-sm font-bold text-[#38323F]">Gender</legend>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Gender">
            {[{ value: 'male' as const, label: 'Male', icon: Mars }, { value: 'female' as const, label: 'Female', icon: Venus }].map((option) => {
              const selected = formData.gender === option.value;
              const Icon = option.icon;
              return (
                <button key={option.value} type="button" role="radio" aria-checked={selected} onClick={() => onChange('gender', option.value)} className={`flex min-h-[58px] items-center gap-3 rounded-xl border px-4 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7482A4]/20 ${selected ? 'border-[#7482A4] bg-[#7482A4]/10 text-[#586682] shadow-[0_8px_20px_rgba(116,130,164,0.10)]' : 'border-[#7482A4]/25 bg-white text-[#5F5964] hover:border-[#7482A4]/[0.55]'}`}>
                  <Icon size={21} aria-hidden="true" />
                  <span>{option.label}</span>
                  {selected && <Check className="ml-auto" size={18} strokeWidth={2.5} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </fieldset>
        <NumberField id="height_cm" label="Height" value={formData.height_cm} suffix="cm" min={numericRules.height_cm.min} max={numericRules.height_cm.max} error={touched.height_cm ? fieldErrors.height_cm : ''} onChange={(value) => onChange('height_cm', value)} onBlur={() => setTouched((current) => ({ ...current, height_cm: true }))} />
        <NumberField id="weight_kg" label="Current Weight" value={formData.weight_kg} suffix="kg" min={numericRules.weight_kg.min} max={numericRules.weight_kg.max} error={touched.weight_kg ? fieldErrors.weight_kg : ''} onChange={(value) => onChange('weight_kg', value)} onBlur={() => setTouched((current) => ({ ...current, weight_kg: true }))} />
      </div>
      <fieldset className="mt-8">
        <legend className="text-xl font-bold tracking-[-0.025em] text-[#38323F] sm:text-2xl">How active are you?</legend>
        <p className="mt-1 text-sm leading-6 text-[#6A6470]">Choose the option that best describes your typical week. We&apos;ll use this to estimate your daily energy needs.</p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" role="radiogroup" aria-label="Activity level">
          {activityOptions.map((option) => {
            const selected = formData.activity_level === option.value;
            return (
              <button key={option.value} type="button" role="radio" aria-checked={selected} onClick={() => onChange('activity_level', option.value)} className={`group relative flex min-h-[285px] flex-col items-center overflow-hidden rounded-2xl border p-4 text-center transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7482A4]/20 ${selected ? 'border-[#7482A4] bg-[#7482A4]/[0.08] shadow-[0_14px_32px_rgba(116,130,164,0.14)]' : 'border-[#7482A4]/[0.22] bg-white hover:-translate-y-0.5 hover:border-[#7482A4]/[0.55] hover:shadow-[0_12px_28px_rgba(56,50,63,0.08)]'}`}>
                {selected && <span className="absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-[#7482A4] text-white shadow-sm"><Check size={15} strokeWidth={3} aria-hidden="true" /></span>}
                <img src={option.image} alt={`Rocco demonstrating a ${option.label.toLowerCase()} lifestyle`} className="h-28 w-full select-none object-contain transition duration-300 group-hover:scale-[1.03]" draggable={false} />
                <span className={`mt-2 text-base font-bold ${selected ? 'text-[#657493]' : 'text-[#38323F]'}`}>{option.label}</span>
                <span className={`mt-1 min-h-[58px] text-xs leading-[1.45] ${selected ? 'text-[#657493]' : 'text-[#6B6570]'}`}>{option.description}</span>
                <span className={`mt-auto pt-3 text-xs font-semibold ${selected ? 'text-[#657493]' : 'text-[#5F5964]'}`}>{option.frequency}</span>
                <span className="mt-3 flex gap-2" aria-hidden="true">
                  {[1, 2, 3, 4].map((dot) => <span key={dot} className={`size-2 rounded-full border ${dot <= option.level ? 'border-[#7482A4] bg-[#7482A4]' : 'border-[#7482A4]/[0.35] bg-white'}`} />)}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#7482A4]/[0.15] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} disabled={isLoading} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#7482A4]/[0.45] bg-white px-6 text-sm font-bold text-[#38323F] transition hover:border-[#7482A4] hover:bg-[#7482A4]/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7482A4]/20 disabled:cursor-not-allowed disabled:opacity-50">
          <ArrowLeft size={18} aria-hidden="true" />Back
        </button>
        <button type="submit" disabled={!isValid || isLoading} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#7482A4] px-8 text-sm font-bold text-white shadow-[0_12px_28px_rgba(116,130,164,0.24)] transition hover:bg-[#657493] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7482A4]/25 disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-45 sm:min-w-[190px]">
          {isLoading ? <><LoaderCircle className="animate-spin" size={18} aria-hidden="true" />Calculating…</> : <><ArrowRight size={18} aria-hidden="true" />Continue</>}
        </button>
      </div>
    </form>
  );
}

interface NumberFieldProps { id: NumericField; label: string; value: string; suffix: string; min: number; max: number; error: string; onChange: (value: string) => void; onBlur: () => void; }

function NumberField({ id, label, value, suffix, min, max, error, onChange, onBlur }: NumberFieldProps) {
  const errorId = `${id}-error`;
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-2 block text-sm font-bold text-[#38323F]">{label}</span>
      <span className={`flex min-h-[58px] items-center rounded-xl border bg-white px-4 transition focus-within:ring-4 ${error ? 'border-[#B96F78]/70 focus-within:ring-[#B96F78]/10' : 'border-[#7482A4]/25 focus-within:border-[#7482A4] focus-within:ring-[#7482A4]/[0.12]'}`}>
        <input id={id} type="number" inputMode="numeric" min={min} max={max} step="1" value={value} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className="min-w-0 flex-1 bg-transparent text-base font-semibold text-[#38323F] outline-none placeholder:text-[#8B8590]" placeholder="Enter value" />
        <span className="ml-3 shrink-0 text-sm font-medium text-[#746D79]">{suffix}</span>
      </span>
      <span id={errorId} className="mt-1.5 block min-h-4 text-xs text-[#9D5963]" role={error ? 'alert' : undefined}>{error}</span>
    </label>
  );
}