import {
  BarChart3,
  Dumbbell,
  Leaf,
  Moon,
  Salad,
  Sparkles,
} from 'lucide-react'

interface CoachCapabilitiesProps {
  disabled: boolean
  onPrompt: (prompt: string) => void
}

const CAPABILITIES = [
  {
    title: 'Workout advice',
    description:
      'Get personalized workout recommendations and training feedback.',
    prompt:
      'Review my current workout plan and give me training advice for today.',
    icon: Dumbbell,
  },
  {
    title: 'Meal guidance',
    description:
      'Find healthy meal ideas and nutrition advice.',
    prompt:
      'Give me meal guidance for the rest of today based on my goals.',
    icon: Salad,
  },
  {
    title: 'Macro feedback',
    description:
      'Analyze your nutrition and help you hit your goals.',
    prompt:
      'Review my macros today and tell me what I should prioritize next.',
    icon: BarChart3,
  },
  {
    title: 'Recovery tips',
    description:
      'Learn how to rest, recover, and perform better.',
    prompt:
      'What should I do today to improve my recovery?',
    icon: Moon,
  },
  {
    title: 'Daily motivation',
    description:
      'Stay consistent with support and encouragement.',
    prompt:
      'Give me a short practical motivation check-in for today.',
    icon: Leaf,
  },
] as const

export function CoachCapabilities({
  disabled,
  onPrompt,
}: CoachCapabilitiesProps) {
  return (
    <section className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-[#7482A4]" />
        <h2 className="text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
          What Rocco can help with
        </h2>
      </div>

      <div className="mt-4 space-y-1">
        {CAPABILITIES.map(
          ({
            title,
            description,
            prompt,
            icon: Icon,
          }) => (
            <button
              key={title}
              type="button"
              disabled={disabled}
              onClick={() => onPrompt(prompt)}
              className="group flex w-full items-start gap-3 rounded-2xl p-2.5 text-left transition hover:bg-[#F8F7FA] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#7482A4]/10 text-[#7482A4]">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#38323F]">
                  {title}
                </p>
                <p className="mt-0.5 text-[11px] leading-4 text-[#8B8690]">
                  {description}
                </p>
              </div>
            </button>
          ),
        )}
      </div>
    </section>
  )
}
