import type { ChangeEvent, RefObject } from 'react'
import { Loader2, RotateCcw, Sparkles } from 'lucide-react'
import { useState } from 'react'

import { useLogParsedMeal, useParseMeal } from '../../hooks/useMeal'
import type { MealType, ParsedMealData } from '../../services/types/meal'
import { useToastStore } from '../../stores/toastStore'
import { getDefaultMealType } from './meal.utils'
import { MealTypeSelector } from './MealTypeSelector'
import { ParsedMealPreview } from './ParsedMealPreview'

interface AIMealParserProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>
}

export function AIMealParser({ textareaRef }: AIMealParserProps) {
  const [text, setText] = useState('')
  const [parsed, setParsed] = useState<ParsedMealData | null>(null)
  const [mealType, setMealType] = useState<MealType>(getDefaultMealType())
  const parseMutation = useParseMeal()
  const logMutation = useLogParsedMeal()
  const showToast = useToastStore((state) => state.showToast)

  const handleParse = async () => {
    const prompt = text.trim()
    if (!prompt || parseMutation.isPending) return

    try {
      const response = await parseMutation.mutateAsync({ text: prompt })
      setParsed(response.data)
    } catch (error) {
      showToast({
        type: 'error',
        heading: 'Meal parsing failed',
        subheading:
          error instanceof Error
            ? error.message
            : 'FitPilot could not parse this meal. Please try again.',
      })
    }
  }

  const handleLog = async () => {
    if (!parsed || logMutation.isPending) return

    try {
      const response = await logMutation.mutateAsync({
        meal_type: mealType,
        raw_input_prompt: text.trim(),
        data: parsed,
      })

      showToast({
        type: 'success',
        heading: 'Meal logged',
        subheading: response.message || 'Your nutrition totals are now updated.',
      })

      setText('')
      setParsed(null)
      setMealType(getDefaultMealType())
      textareaRef.current?.focus()
    } catch (error) {
      showToast({
        type: 'error',
        heading: 'Could not log meal',
        subheading:
          error instanceof Error
            ? error.message
            : 'Your parsed meal is still here so you can retry.',
      })
    }
  }

  const handleClear = () => {
    if (parseMutation.isPending || logMutation.isPending) return
    setText('')
    setParsed(null)
    textareaRef.current?.focus()
  }

  const busy = parseMutation.isPending || logMutation.isPending

  return (
    <section
      id="ai-meal-parser"
      className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#7482A4]" />
            <h2 className="text-lg font-extrabold tracking-[-0.02em] text-[#38323F]">
              AI Meal Parser
            </h2>
          </div>
          <p className="mt-1 text-xs leading-5 text-[#8B8690]">
            Describe your meal in plain text and we&apos;ll estimate the nutrition for you.
          </p>
        </div>
        <span className="rounded-full bg-[#7482A4]/10 px-3 py-1.5 text-[10px] font-extrabold text-[#7482A4]">
          Powered by FitPilot AI
        </span>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <div>
          <label className="block">
            <span className="sr-only">Describe your meal</span>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setText(event.target.value)}
              disabled={busy}
              rows={6}
              placeholder="e.g. 2 cups rice, chicken adobo, and banana"
              className="w-full resize-none rounded-2xl border border-[#7482A4]/15 bg-[#FBFAFC] p-4 text-sm leading-6 text-[#38323F] outline-none transition placeholder:text-[#9E99A3] focus:border-[#7482A4] focus:ring-2 focus:ring-[#7482A4]/15 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </label>

          <p className="mt-2 text-[11px] text-[#8B8690]">
            Tip: include portions, sauces, oils, and drinks for a better estimate.
          </p>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleParse}
              disabled={!text.trim() || parseMutation.isPending || logMutation.isPending}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#7482A4] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#657493] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
            >
              {parseMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {parsed ? 'Parse Again' : 'Parse Meal'}
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={busy || (!text && !parsed)}
              aria-label="Clear parser"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#7482A4]/15 bg-white text-[#7482A4] transition hover:bg-[#F5F3F6] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <ParsedMealPreview parsed={parsed} />
      </div>

      <div className="mt-5 grid gap-4 border-t border-[#7482A4]/10 pt-5 lg:grid-cols-[1fr_220px] lg:items-end">
        <MealTypeSelector
          value={mealType}
          onChange={setMealType}
          disabled={busy}
        />

        <button
          type="button"
          onClick={handleLog}
          disabled={!parsed || logMutation.isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#7482A4] px-5 text-sm font-extrabold text-white transition hover:bg-[#657493] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
        >
          {logMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span aria-hidden="true">✓</span>
          )}
          Log Meal
        </button>
      </div>
    </section>
  )
}
