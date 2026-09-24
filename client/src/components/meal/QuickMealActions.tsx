import {
  ChevronRight,
  History,
  ListChecks,
  Plus,
  Sparkles,
} from 'lucide-react'

interface QuickMealActionsProps {
  onParseAI: () => void
  onLogManual: () => void
  onViewToday: () => void
  onViewHistory: () => void
}

export function QuickMealActions({
  onParseAI,
  onLogManual,
  onViewToday,
  onViewHistory,
}: QuickMealActionsProps) {
  const actions = [
    {
      label: 'Parse AI Meal',
      description: 'Describe your meal with AI',
      icon: Sparkles,
      onClick: onParseAI,
    },
    {
      label: 'Log Manual Meal',
      description: 'Add a meal manually',
      icon: Plus,
      onClick: onLogManual,
    },
    {
      label: "View Today's Meals",
      description: "Jump to today's meal list",
      icon: ListChecks,
      onClick: onViewToday,
    },
    {
      label: 'Week & Meal History',
      description: 'Review weekly and recent nutrition',
      icon: History,
      onClick: onViewHistory,
    },
  ]

  return (
    <section className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
      <h2 className="text-lg font-extrabold tracking-[-0.02em] text-[#38323F]">
        Quick Actions
      </h2>

      <div className="mt-4 space-y-2">
        {actions.map(({ label, description, icon: Icon, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className="group flex w-full items-center gap-3 rounded-2xl border border-[#7482A4]/10 bg-[#FCFBFD] p-3 text-left transition hover:border-[#7482A4]/25 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#7482A4]/10 text-[#7482A4]">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-[#38323F]">{label}</p>
              <p className="mt-0.5 truncate text-[11px] text-[#8B8690]">{description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-[#A19CA5] transition group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    </section>
  )
}
