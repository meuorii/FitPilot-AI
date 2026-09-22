import {
  BarChart3,
  Dumbbell,
  Salad,
  Utensils,
} from 'lucide-react'

interface CoachQuickPromptsProps {
  disabled: boolean
  onPrompt: (prompt: string) => void
}

const QUICK_PROMPTS = [
  {
    label: 'Plan my meals',
    prompt:
      'Plan my meals for today based on my goals.',
    icon: Utensils,
  },
  {
    label: 'Help me hit protein',
    prompt:
      'Help me hit my protein target today.',
    icon: Dumbbell,
  },
  {
    label: "Suggest today's workout",
    prompt:
      "Suggest today's workout based on my current plan.",
    icon: Salad,
  },
  {
    label: 'Review my calories',
    prompt: 'Review my calories for today.',
    icon: BarChart3,
  },
] as const

export function CoachQuickPrompts({
  disabled,
  onPrompt,
}: CoachQuickPromptsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {QUICK_PROMPTS.map(
        ({ label, prompt, icon: Icon }) => (
          <button
            key={label}
            type="button"
            disabled={disabled}
            onClick={() => onPrompt(prompt)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#7482A4]/15 bg-white px-3 py-2 text-[11px] font-bold text-[#5E6C8C] transition hover:border-[#7482A4]/35 hover:bg-[#F5F3F6] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ),
      )}
    </div>
  )
}
