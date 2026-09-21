import { Utensils } from 'lucide-react'

interface MealEmptyStateProps {
  onParseAI: () => void
  onLogManual: () => void
}

export function MealEmptyState({
  onParseAI,
  onLogManual,
}: MealEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[#7482A4]/20 bg-[#FAF9FB] px-5 py-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#7482A4]/10 text-[#7482A4]">
        <Utensils className="h-5 w-5" />
      </div>
      <h3 className="mt-3 text-sm font-extrabold text-[#38323F]">
        No meals logged today
      </h3>
      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-[#8B8690]">
        Start by describing a meal with AI or add one manually.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onParseAI}
          className="rounded-xl bg-[#7482A4] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#657493] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
        >
          Parse with AI
        </button>
        <button
          type="button"
          onClick={onLogManual}
          className="rounded-xl border border-[#7482A4]/20 bg-white px-4 py-2.5 text-xs font-extrabold text-[#5F6E91] transition hover:bg-[#F5F3F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
        >
          Log Manually
        </button>
      </div>
    </div>
  )
}
