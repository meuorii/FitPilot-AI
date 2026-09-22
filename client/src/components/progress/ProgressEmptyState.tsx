import type { LucideIcon } from 'lucide-react'
import { Activity } from 'lucide-react'

interface ProgressEmptyStateProps {
  title: string
  description: string
  icon?: LucideIcon
  actionLabel?: string
  onAction?: () => void
  compact?: boolean
}

export function ProgressEmptyState({
  title,
  description,
  icon: Icon = Activity,
  actionLabel,
  onAction,
  compact = false,
}: ProgressEmptyStateProps) {
  return (
    <div
      className={`grid place-items-center text-center ${
        compact ? 'min-h-36 py-4' : 'min-h-52 py-7'
      }`}
    >
      <div className="max-w-sm">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-[#7482A4]/10 text-[#7482A4]">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mt-3 text-sm font-extrabold text-[#38323F]">
          {title}
        </h3>
        <p className="mt-1.5 text-xs leading-5 text-[#817C86]">
          {description}
        </p>

        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="mt-4 rounded-xl bg-[#7482A4] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#657493] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  )
}
