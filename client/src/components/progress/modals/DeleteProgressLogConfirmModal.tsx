import {
  useEffect,
  type MouseEvent,
} from 'react'
import {
  Loader2,
  Trash2,
  X,
} from 'lucide-react'

import type { ProgressLog } from '../../../services/types/progress'
import { formatDate } from '../progress.utils'

interface DeleteProgressLogConfirmModalProps {
  log: ProgressLog
  isDeleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteProgressLogConfirmModal({
  log,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteProgressLogConfirmModalProps) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isDeleting, onCancel])

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[80] grid place-items-center bg-[#38323F]/35 p-4 backdrop-blur-[2px]"
      onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget && !isDeleting) {
          onCancel()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-progress-title"
        className="w-full max-w-md rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_24px_70px_rgba(56,50,63,0.20)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#B96F78]/10 text-[#B96F78]">
            <Trash2 className="h-5 w-5" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            aria-label="Close delete confirmation"
            className="grid h-9 w-9 place-items-center rounded-xl text-[#817C86] transition hover:bg-[#F5F3F6] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h2
          id="delete-progress-title"
          className="mt-4 text-xl font-extrabold tracking-[-0.025em] text-[#38323F]"
        >
          Delete this check-in?
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#817C86]">
          This will remove the {formatDate(log.logged_at)} check-in from your
          progress history and may change your latest metrics and trend charts.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="h-11 rounded-xl border border-[#7482A4]/15 px-4 text-sm font-extrabold text-[#5F5A64] transition hover:bg-[#F5F3F6] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#B96F78] px-4 text-sm font-extrabold text-white transition hover:bg-[#A96069] disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B96F78]"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {isDeleting ? 'Deleting...' : 'Delete Check-In'}
          </button>
        </div>
      </section>
    </div>
  )
}
