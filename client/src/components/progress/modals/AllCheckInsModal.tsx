import {
  useEffect,
  useState,
  type MouseEvent,
} from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from 'lucide-react'

import { useProgressLogs } from '../../../hooks/useProgress'
import type { ProgressLog } from '../../../services/types/progress'
import { ProgressLogCollection } from '../RecentCheckIns'

interface AllCheckInsModalProps {
  onClose: () => void
  onDelete: (log: ProgressLog) => void
}

const PAGE_SIZE = 10

export function AllCheckInsModal({
  onClose,
  onDelete,
}: AllCheckInsModalProps) {
  const [offset, setOffset] = useState(0)
  const logsQuery = useProgressLogs({
    limit: PAGE_SIZE,
    offset,
  })

  const data = logsQuery.data?.data
  const total = data?.pagination.total ?? 0
  const page = Math.floor(offset / PAGE_SIZE) + 1
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    if (total > 0 && offset >= total) {
      setOffset(Math.max(0, offset - PAGE_SIZE))
    }
  }, [offset, total])

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[70] grid place-items-center bg-[#38323F]/35 p-4 backdrop-blur-[2px]"
      onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="all-checkins-title"
        className="flex max-h-[min(760px,calc(100vh-40px))] w-full max-w-5xl flex-col overflow-hidden rounded-[26px] border border-[#7482A4]/12 bg-white shadow-[0_24px_70px_rgba(56,50,63,0.20)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#7482A4]/10 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="all-checkins-title"
              className="text-xl font-extrabold tracking-[-0.025em] text-[#38323F]"
            >
              All Check-Ins
            </h2>
            <p className="mt-0.5 text-xs text-[#817C86]">
              {total} total check-in{total === 1 ? '' : 's'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close all check-ins"
            className="grid h-9 w-9 place-items-center rounded-xl text-[#817C86] transition hover:bg-[#F5F3F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {logsQuery.isLoading ? (
            <div className="grid min-h-64 place-items-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#7482A4]" />
                <p className="mt-2 text-xs font-semibold text-[#817C86]">
                  Loading check-ins...
                </p>
              </div>
            </div>
          ) : logsQuery.isError ? (
            <div className="grid min-h-64 place-items-center text-center">
              <div>
                <p className="text-sm font-extrabold text-[#38323F]">
                  Couldn&apos;t load check-ins
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void logsQuery.refetch()
                  }}
                  className="mt-3 rounded-xl bg-[#7482A4] px-4 py-2.5 text-xs font-extrabold text-white"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : data?.logs.length ? (
            <ProgressLogCollection
              logs={data.logs}
              onDelete={onDelete}
            />
          ) : (
            <div className="grid min-h-64 place-items-center text-center">
              <p className="text-sm font-semibold text-[#817C86]">
                No check-ins found.
              </p>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#7482A4]/10 px-5 py-4 sm:px-6">
          <p className="text-xs font-semibold text-[#817C86]">
            Page {page} of {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={offset === 0 || logsQuery.isFetching}
              onClick={() =>
                setOffset((current) =>
                  Math.max(0, current - PAGE_SIZE),
                )
              }
              className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#7482A4]/15 px-3 text-xs font-extrabold text-[#5F5A64] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              type="button"
              disabled={
                !data?.pagination.has_more || logsQuery.isFetching
              }
              onClick={() =>
                setOffset((current) => current + PAGE_SIZE)
              }
              className="inline-flex h-9 items-center gap-1 rounded-xl bg-[#7482A4] px-3 text-xs font-extrabold text-white disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
