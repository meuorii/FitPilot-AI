import {
  ChevronRight,
  Lightbulb,
} from 'lucide-react'

import type { CoachContextData } from '../../services/types/coach'

interface SuggestedPromptsProps {
  context?: CoachContextData
  disabled: boolean
  onPrompt: (prompt: string) => void
}

const roundUseful = (value: number) =>
  Math.round(value * 10) / 10

const buildPrompts = (
  context?: CoachContextData,
) => {
  const prompts: string[] = []

  if (
    context &&
    context.nutrition.protein.remaining > 0
  ) {
    prompts.push(
      `Help me eat the remaining ${roundUseful(
        context.nutrition.protein.remaining,
      )}g of protein today.`,
    )
  } else {
    prompts.push(
      'What should I eat to support my protein goal?',
    )
  }

  if (
    context &&
    context.nutrition.calories.remaining > 0
  ) {
    prompts.push(
      `I have ${roundUseful(
        context.nutrition.calories.remaining,
      )} calories remaining. What should I eat?`,
    )
  } else {
    prompts.push(
      'Create a simple meal plan for today.',
    )
  }

  if (context?.workout.status === 'rest_day') {
    prompts.push(
      'What should I focus on during my rest day?',
    )
  } else if (
    context?.workout.status === 'not_started'
  ) {
    const routine =
      context.workout.today.routine_name

    prompts.push(
      routine
        ? `How should I approach my ${routine} workout today?`
        : "How should I approach today's workout?",
    )
  } else if (
    context?.workout.status === 'no_split'
  ) {
    prompts.push(
      'How should I structure my workout routine?',
    )
  } else {
    prompts.push(
      'Review my workout situation for today.',
    )
  }

  prompts.push(
    'What is the most important thing I should focus on today?',
  )

  return prompts.slice(0, 4)
}

export function SuggestedPrompts({
  context,
  disabled,
  onPrompt,
}: SuggestedPromptsProps) {
  const prompts = buildPrompts(context)

  return (
    <section className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-[#C6A45D]" />
        <h2 className="text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
          Suggested Prompts
        </h2>
      </div>

      <div className="mt-4 space-y-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={disabled}
            onClick={() => onPrompt(prompt)}
            className="group flex w-full items-center gap-3 rounded-xl border border-[#7482A4]/10 bg-[#FCFBFD] px-3 py-2.5 text-left transition hover:border-[#7482A4]/25 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            <span className="min-w-0 flex-1 text-[11px] font-semibold leading-4 text-[#5F5A64]">
              {prompt}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#9F9AA3] transition group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    </section>
  )
}
