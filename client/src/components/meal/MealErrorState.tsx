import { AlertCircle, RefreshCw } from 'lucide-react'

interface MealErrorStateProps {
  onRetry: () => void
  isRetrying?: boolean
}

export function MealErrorState({
  onRetry,
  isRetrying = false,
}: MealErrorStateProps) {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="w-full max-w-md rounded-[24px] border border-[#7482A4]/12 bg-white p-7 text-center shadow-[0_8px_30px_rgba(56,50,63,0.05)]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#B96F78]/10 text-[#B96F78]">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-extrabold text-[#38323F]">
          Meals could not be loaded
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#77727B]">
          FitPilot couldn&apos;t retrieve today&apos;s meal logs. Your data has not been changed.
        </p>
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#7482A4] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#657493] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
        >
          <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          Retry
        </button>
      </div>
    </div>
  )
}
