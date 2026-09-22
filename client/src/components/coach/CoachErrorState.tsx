import {
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

interface CoachErrorStateProps {
  title?: string
  description?: string
  isRetrying?: boolean
  onRetry: () => void
}

export function CoachErrorState({
  title = 'Coach context unavailable',
  description = 'Rocco can still chat with you. Retry to refresh your live goals, nutrition, and workout context.',
  isRetrying = false,
  onRetry,
}: CoachErrorStateProps) {
  return (
    <section className="grid min-h-[286px] place-items-center rounded-[24px] border border-[#B96F78]/15 bg-white p-6 text-center shadow-[0_8px_28px_rgba(56,50,63,0.045)]">
      <div className="max-w-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#B96F78]/10 text-[#B96F78]">
          <AlertCircle className="h-5 w-5" />
        </div>
        <h2 className="mt-3 text-base font-extrabold text-[#38323F]">
          {title}
        </h2>
        <p className="mt-1 text-xs leading-5 text-[#817C86]">
          {description}
        </p>
        <button
          type="button"
          disabled={isRetrying}
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#7482A4] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#657493] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isRetrying ? 'animate-spin' : ''
            }`}
          />
          Retry context
        </button>
      </div>
    </section>
  )
}
