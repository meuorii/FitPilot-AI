import {
  MessageCircleMore,
  Sparkles,
} from 'lucide-react'

interface CoachEmptyStateProps {
  disabled: boolean
  onPrompt: (prompt: string) => void
}

const STARTER_PROMPTS = [
  'What should I focus on today?',
  'Help me plan a high-protein day.',
  'How should I approach my workout today?',
] as const

export function CoachEmptyState({
  disabled,
  onPrompt,
}: CoachEmptyStateProps) {
  return (
    <div className="grid min-h-[340px] place-items-center px-3 py-8 text-center">
      <div className="w-full max-w-lg">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-[20px] bg-[#7482A4]/10 text-[#7482A4]">
          <MessageCircleMore className="h-6 w-6" />
        </div>

        <h3 className="mt-4 text-xl font-extrabold tracking-[-0.025em] text-[#38323F]">
          Ask Rocco anything
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#817C86]">
          Get help with workouts, meals, macros, recovery, or staying consistent with your plan.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={disabled}
              onClick={() => onPrompt(prompt)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#7482A4]/15 bg-white px-3.5 py-2.5 text-xs font-bold text-[#5E6C8C] transition hover:bg-[#F5F3F6] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
