import { AlertCircle, RefreshCw } from 'lucide-react'

interface WorkoutErrorStateProps {
  onRetry: () => void
  isRetrying?: boolean
}

export function WorkoutErrorState({
  onRetry,
  isRetrying = false,
}: WorkoutErrorStateProps) {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <div className="w-full max-w-md rounded-[24px] border border-[#EAE7EC] bg-white p-7 text-center shadow-[0_8px_30px_rgba(56,50,63,0.05)]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#F2F3F7] text-[#7482A4]">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-extrabold text-[#38323F]">
          Couldn&apos;t load your workouts
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#817B85]">
          Check your connection and try the workout request again.
        </p>
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#38323F] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#4A4350] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Retrying...' : 'Retry'}
        </button>
      </div>
    </div>
  )
}
