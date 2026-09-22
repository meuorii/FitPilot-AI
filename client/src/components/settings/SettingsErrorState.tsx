import {
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

interface SettingsErrorStateProps {
  error?: string | null
  isRetrying: boolean
  onRetry: () => void
}

export function SettingsErrorState({
  error,
  isRetrying,
  onRetry,
}: SettingsErrorStateProps) {
  return (
    <section className="grid min-h-[420px] place-items-center rounded-[24px] border border-[#B96F78]/15 bg-white p-6 text-center shadow-[0_8px_28px_rgba(56,50,63,0.045)]">
      <div className="max-w-md">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#B96F78]/10 text-[#B96F78]">
          <AlertCircle className="h-5 w-5" />
        </div>

        <h2 className="mt-4 text-lg font-extrabold text-[#38323F]">
          Settings unavailable
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#817C86]">
          {error ||
            'We could not load your Settings data right now. Your other FitPilot pages are unaffected.'}
        </p>

        <button
          type="button"
          disabled={isRetrying}
          onClick={onRetry}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#7482A4] px-5 text-sm font-extrabold text-white transition hover:bg-[#657493] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isRetrying
                ? 'animate-spin'
                : ''
            }`}
          />
          Retry
        </button>
      </div>
    </section>
  )
}
