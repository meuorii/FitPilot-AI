import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
} from 'react'
import { ArrowLeft, Calculator, Check, Loader2, Trash2, X } from 'lucide-react'

import { useLogMealItems, useParseMealSmart } from '../../../hooks/useMeal'
import type { MealType, SmartParsedMeal } from '../../../services/types/meal'
import { useToastStore } from '../../../stores/toastStore'
import { formatMacroNumber, getDefaultMealType } from '../meal.utils'
import { MealTypeSelector } from '../MealTypeSelector'
import { SmartInputPreview } from '../SmartInputPreview'
import {
  MACRO_FIELDS,
  SMART_MAX_TEXT_LENGTH,
  SMART_PARSER_SUMMARY,
  SMART_SOURCE_LABELS,
  SMART_TABLE_EXAMPLE,
  SMART_TEXT_EXAMPLE,
  buildLogPayload,
  sumEditableFoods,
  toEditableFoods,
  type EditableSmartFood,
  type MacroField,
} from '../smartMeal.utils'

interface SmartMealModalProps {
  open: boolean
  onClose: () => void
}

type Stage = 'input' | 'review'

const SOURCE_BADGE_STYLES: Record<EditableSmartFood['source'], string> = {
  table: 'bg-[#7482A4]/10 text-[#7482A4]',
  db: 'bg-[#F5F3F6] text-[#6F6A74]',
  ai: 'bg-[#8B7BB8]/12 text-[#6D5DA0]',
  manual: 'bg-[#B96F78]/10 text-[#B96F78]',
}

const ROW_GRID =
  'sm:grid-cols-[minmax(0,1fr)_68px_68px_68px_68px_32px]'

export function SmartMealModal({ open, onClose }: SmartMealModalProps) {
  const [stage, setStage] = useState<Stage>('input')
  const [text, setText] = useState('')
  const [mealType, setMealType] = useState<MealType>(getDefaultMealType())
  const [result, setResult] = useState<SmartParsedMeal | null>(null)
  const [foods, setFoods] = useState<EditableSmartFood[]>([])
  const [error, setError] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const parseMutation = useParseMealSmart()
  const logMutation = useLogMealItems()
  const showToast = useToastStore((state) => state.showToast)

  const busy = parseMutation.isPending || logMutation.isPending
  const totals = useMemo(() => sumEditableFoods(foods), [foods])
  const manualCount = foods.filter((food) => food.source === 'manual').length

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, busy, onClose])

  useEffect(() => {
    if (!open || stage !== 'input') return
    const timer = window.setTimeout(() => textareaRef.current?.focus(), 60)
    return () => window.clearTimeout(timer)
  }, [open, stage])

  if (!open) return null

  const resetAll = () => {
    setStage('input')
    setText('')
    setMealType(getDefaultMealType())
    setResult(null)
    setFoods([])
    setError(null)
    parseMutation.reset()
  }

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value)
    setError(null)
  }

  const handleAnalyze = async () => {
    const prompt = text.trim()
    if (!prompt || busy) return

    setError(null)

    try {
      const response = await parseMutation.mutateAsync({
        text: prompt,
        meal_type: mealType,
      })

      setResult(response.data)
      setFoods(toEditableFoods(response.data.foods))
      setStage('review')
    } catch (analyzeError) {
      showToast({
        type: 'error',
        heading: 'Could not analyze meal',
        subheading:
          analyzeError instanceof Error
            ? analyzeError.message
            : 'Please check your text and try again.',
      })
    }
  }

  const updateMacro = (key: string, field: MacroField, value: string) => {
    setFoods((current) =>
      current.map((food) => (food.key === key ? { ...food, [field]: value } : food)),
    )
    setError(null)
  }

  const removeFood = (key: string) => {
    setFoods((current) => current.filter((food) => food.key !== key))
    setError(null)
  }

  const handleLog = async () => {
    if (logMutation.isPending) return

    const payload = buildLogPayload(foods)

    if (!payload.ok) {
      setError(payload.error)
      return
    }

    if (payload.items.length === 0) {
      setError('Add at least one food item to log this meal.')
      return
    }

    try {
      const response = await logMutation.mutateAsync({
        meal_type: mealType,
        items: payload.items,
      })

      showToast({
        type: 'success',
        heading: payload.items.length === 1 ? 'Meal logged' : `${payload.items.length} meals logged`,
        subheading: response.message || 'Your nutrition totals are now updated.',
      })

      resetAll()
      onClose()
    } catch (logError) {
      showToast({
        type: 'error',
        heading: 'Could not log meal',
        subheading:
          logError instanceof Error
            ? logError.message
            : 'Your meal is still here so you can retry.',
      })
    }
  }

  const isReview = stage === 'review'

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-[#27232B]/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget && !busy) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="smart-meal-title"
        className="max-h-[90vh] w-full max-w-[860px] overflow-y-auto rounded-[26px] bg-white shadow-[0_28px_80px_rgba(25,22,30,0.22)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#7482A4]/10 px-5 py-5 sm:px-6">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#7482A4]">
              Smart meal parser
            </p>
            <h2
              id="smart-meal-title"
              className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-[#38323F]"
            >
              {isReview ? 'Review before logging' : 'Paste a meal or nutrition table'}
            </h2>
            <p className="mt-1 text-xs leading-5 text-[#8B8690]">
              {isReview
                ? 'Check the values, fix anything that looks off, then log it.'
                : 'Type your meal in plain text, or paste a table with Calories, Protein, Carbs and Fat columns.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close smart meal parser"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F5F3F6] text-[#6F6A74] transition hover:bg-[#ECE9EF] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isReview ? (
          <div className="space-y-5 px-5 py-5 sm:px-6">
            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <label htmlFor="smart-meal-text" className="text-xs font-extrabold text-[#38323F]">
                  Your meal *
                </label>
                <textarea
                  id="smart-meal-text"
                  ref={textareaRef}
                  value={text}
                  onChange={handleTextChange}
                  disabled={busy}
                  rows={10}
                  maxLength={SMART_MAX_TEXT_LENGTH}
                  spellCheck={false}
                  placeholder={'e.g. 2 cups sinangag, tuna omelette, 1 hopia\n\nor paste a table:\nFood Item  Calories  Protein  Carbs  Fat'}
                  className="mt-2 w-full resize-none rounded-2xl border border-[#7482A4]/15 bg-[#FBFAFC] p-4 text-[13px] leading-6 text-[#38323F] outline-none transition placeholder:text-[#9E99A3] focus:border-[#7482A4] focus:ring-2 focus:ring-[#7482A4]/15 disabled:cursor-not-allowed disabled:opacity-70"
                />

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setText(SMART_TEXT_EXAMPLE)}
                    disabled={busy}
                    className="rounded-full border border-[#7482A4]/15 bg-white px-3 py-1.5 text-[11px] font-bold text-[#5F5A64] transition hover:bg-[#F5F3F6] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
                  >
                    Try a text example
                  </button>
                  <button
                    type="button"
                    onClick={() => setText(SMART_TABLE_EXAMPLE)}
                    disabled={busy}
                    className="rounded-full border border-[#7482A4]/15 bg-white px-3 py-1.5 text-[11px] font-bold text-[#5F5A64] transition hover:bg-[#F5F3F6] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
                  >
                    Try a table example
                  </button>
                  <span className="ml-auto text-[10px] font-semibold text-[#9E99A3]">
                    {text.length} / {SMART_MAX_TEXT_LENGTH}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-extrabold text-[#38323F]">Input preview</p>
                <div className="mt-2">
                  <SmartInputPreview text={text} />
                </div>
              </div>
            </div>

            <MealTypeSelector value={mealType} onChange={setMealType} disabled={busy} />
          </div>
        ) : (
          <div className="space-y-5 px-5 py-5 sm:px-6">
            {result ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F5F3F6] px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-[#38323F]">
                    {SMART_PARSER_SUMMARY[result.parser]}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#8B8690]">
                    Confidence {Math.round(result.confidence * 100)}%
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStage('input')}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#7482A4]/15 bg-white px-3 py-2 text-[11px] font-extrabold text-[#5F5A64] transition hover:bg-[#FBFAFC] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Edit input
                </button>
              </div>
            ) : null}

            {result && result.warnings.length > 0 ? (
              <div
                role="status"
                className="space-y-1 rounded-2xl border border-[#D9A441]/30 bg-[#FFF8E8] px-4 py-3"
              >
                {result.warnings.map((warning) => (
                  <p key={warning} className="text-[11px] leading-5 text-[#8A6A1F]">
                    {warning}
                  </p>
                ))}
              </div>
            ) : null}

            {manualCount > 0 ? (
              <div
                role="status"
                className="rounded-2xl border border-[#B96F78]/25 bg-[#B96F78]/5 px-4 py-3 text-[11px] leading-5 text-[#9A525B]"
              >
                {manualCount} {manualCount === 1 ? 'item was' : 'items were'} not
                recognised. Enter {manualCount === 1 ? 'its' : 'their'} nutrition
                below, or remove {manualCount === 1 ? 'it' : 'them'}.
              </div>
            ) : null}

            <details className="group rounded-2xl border border-[#7482A4]/12 bg-white">
              <summary className="cursor-pointer select-none px-4 py-3 text-xs font-extrabold text-[#38323F] marker:text-[#7482A4]">
                Your input
              </summary>
              <div className="px-4 pb-4">
                <SmartInputPreview text={text} />
              </div>
            </details>

            {foods.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-[#7482A4]/12">
                <div
                  className={`hidden gap-3 bg-[#FAF9FB] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.05em] text-[#8B8690] sm:grid ${ROW_GRID}`}
                >
                  <span>Food</span>
                  <span className="text-right">Calories</span>
                  <span className="text-right">Protein</span>
                  <span className="text-right">Carbs</span>
                  <span className="text-right">Fat</span>
                  <span />
                </div>

                <div className="divide-y divide-[#7482A4]/10">
                  {foods.map((food) => (
                    <div
                      key={food.key}
                      className={[
                        'grid gap-3 px-3 py-3 sm:items-center',
                        ROW_GRID,
                        food.source === 'manual' ? 'bg-[#FFFAFA]' : '',
                      ].join(' ')}
                    >
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="break-words text-xs font-extrabold text-[#38323F]">
                            {food.name}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${SOURCE_BADGE_STYLES[food.source]}`}
                            >
                              {SMART_SOURCE_LABELS[food.source]}
                            </span>
                            {food.serving ? (
                              <span className="text-[10px] text-[#8B8690]">{food.serving}</span>
                            ) : null}
                          </div>
                          {food.notes ? (
                            <p className="mt-1 text-[10px] leading-4 text-[#8B8690]">
                              {food.notes}
                            </p>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFood(food.key)}
                          disabled={busy}
                          aria-label={`Remove ${food.name}`}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#9E99A3] transition hover:bg-[#F5F3F6] hover:text-[#B96F78] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] sm:hidden"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-2 sm:contents">
                        {MACRO_FIELDS.map(({ key, label, step }) => (
                          <label key={key} className="block">
                            <span className="mb-1 block text-[10px] font-bold text-[#8B8690] sm:sr-only">
                              {label}
                            </span>
                            <input
                              type="number"
                              inputMode="decimal"
                              min="0"
                              step={step}
                              value={food[key]}
                              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                updateMacro(food.key, key, event.target.value)
                              }
                              disabled={busy}
                              placeholder="0"
                              aria-label={`${label} for ${food.name}`}
                              className="h-9 w-full rounded-lg border border-[#7482A4]/15 px-2 text-right text-xs font-semibold text-[#38323F] outline-none focus:border-[#7482A4] focus:ring-2 focus:ring-[#7482A4]/15 disabled:opacity-60"
                            />
                          </label>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFood(food.key)}
                        disabled={busy}
                        aria-label={`Remove ${food.name}`}
                        className="hidden h-8 w-8 place-items-center rounded-lg text-[#9E99A3] transition hover:bg-[#F5F3F6] hover:text-[#B96F78] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] sm:grid"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#7482A4]/20 bg-[#FAF9FB] px-4 py-6 text-center text-xs text-[#8B8690]">
                Nothing to log yet. Go back and edit your input.
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ['Calories', `${Math.round(totals.calories)} kcal`],
                ['Protein', `${formatMacroNumber(totals.protein)}g`],
                ['Carbs', `${formatMacroNumber(totals.carbs)}g`],
                ['Fat', `${formatMacroNumber(totals.fat)}g`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-[#F5F3F6] px-3 py-2">
                  <p className="text-[10px] font-semibold text-[#8B8690]">{label}</p>
                  <p className="mt-0.5 text-xs font-extrabold text-[#38323F]">{value}</p>
                </div>
              ))}
            </div>

            <MealTypeSelector value={mealType} onChange={setMealType} disabled={busy} />

            {foods.length > 1 ? (
              <p className="text-[11px] leading-5 text-[#8B8690]">
                Each food will be saved as its own entry under{' '}
                <span className="font-bold capitalize">{mealType}</span>.
              </p>
            ) : null}
          </div>
        )}

        {error ? (
          <p role="alert" className="px-5 pb-2 text-xs font-semibold text-[#B96F78] sm:px-6">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 border-t border-[#7482A4]/10 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={isReview ? () => setStage('input') : onClose}
            disabled={busy}
            className="rounded-xl border border-[#7482A4]/15 px-4 py-2.5 text-xs font-extrabold text-[#5F5A64] transition hover:bg-[#F5F3F6] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            {isReview ? 'Back' : 'Cancel'}
          </button>

          {isReview ? (
            <button
              type="button"
              onClick={handleLog}
              disabled={busy || foods.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-[#7482A4] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#657493] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
            >
              {logMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {foods.length > 1 ? `Log ${foods.length} Items` : 'Log Meal'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={busy || !text.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#7482A4] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#657493] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
            >
              {parseMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calculator className="h-4 w-4" />
              )}
              Analyze Meal
            </button>
          )}
        </div>
      </section>
    </div>
  )
}