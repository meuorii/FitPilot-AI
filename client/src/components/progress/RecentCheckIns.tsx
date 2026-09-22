import {
  CalendarDays,
  ChevronRight,
  Trash2,
} from 'lucide-react'

import type { ProgressLog } from '../../services/types/progress'
import { ProgressEmptyState } from './ProgressEmptyState'
import {
  formatBodyFat,
  formatDate,
  formatWeight,
} from './progress.utils'

interface ProgressLogCollectionProps {
  logs: ProgressLog[]
  onDelete: (log: ProgressLog) => void
}

export function ProgressLogCollection({
  logs,
  onDelete,
}: ProgressLogCollectionProps) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[620px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#7482A4]/10">
              {['Date', 'Weight (kg)', 'Body Fat (%)', 'Photo Tag', 'Actions'].map(
                (heading) => (
                  <th
                    key={heading}
                    className="px-3 py-3 text-[10px] font-extrabold uppercase tracking-[0.06em] text-[#918B95] first:pl-0 last:pr-0"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr
                key={log.id}
                className="border-b border-[#7482A4]/[0.08] last:border-0"
              >
                <td className="px-3 py-3.5 pl-0 text-xs font-bold text-[#38323F]">
                  {formatDate(log.logged_at)}
                </td>
                <td className="px-3 py-3.5 text-xs text-[#5F5A64]">
                  {formatWeight(log.weight_kg, '—').replace(' kg', '')}
                </td>
                <td className="px-3 py-3.5 text-xs text-[#5F5A64]">
                  {formatBodyFat(log.body_fat_percentage, '—').replace('%', '')}
                </td>
                <td className="px-3 py-3.5 text-xs text-[#5F5A64]">
                  {log.photo_tag || '—'}
                </td>
                <td className="px-3 py-3.5 pr-0 text-right">
                  <button
                    type="button"
                    aria-label={`Delete check-in from ${formatDate(log.logged_at)}`}
                    onClick={() => onDelete(log)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-[#B96F78] transition hover:bg-[#B96F78]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B96F78]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 md:hidden">
        {logs.map((log) => (
          <article
            key={log.id}
            className="rounded-2xl border border-[#7482A4]/10 bg-[#FCFBFD] p-3.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold text-[#38323F]">
                  {formatDate(log.logged_at)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#69636D]">
                  <span>{formatWeight(log.weight_kg)}</span>
                  <span>•</span>
                  <span>{formatBodyFat(log.body_fat_percentage)}</span>
                  {log.photo_tag ? (
                    <>
                      <span>•</span>
                      <span>{log.photo_tag}</span>
                    </>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                aria-label={`Delete check-in from ${formatDate(log.logged_at)}`}
                onClick={() => onDelete(log)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#B96F78] transition hover:bg-[#B96F78]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B96F78]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

interface RecentCheckInsProps {
  logs: ProgressLog[]
  total: number
  isError: boolean
  search: string
  onRetry: () => void
  onDelete: (log: ProgressLog) => void
  onViewAll: () => void
  onLogCheckIn: () => void
}

export function RecentCheckIns({
  logs,
  total,
  isError,
  search,
  onRetry,
  onDelete,
  onViewAll,
  onLogCheckIn,
}: RecentCheckInsProps) {
  return (
    <section className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-[#7482A4]" />
          <div>
            <h2 className="text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
              Recent Check-Ins
            </h2>
            {total > 0 ? (
              <p className="mt-0.5 text-[10px] font-semibold text-[#918B95]">
                {total} total check-in{total === 1 ? '' : 's'}
              </p>
            ) : null}
          </div>
        </div>

        {total > 5 ? (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-extrabold text-[#7482A4] transition hover:bg-[#7482A4]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-4">
        {isError ? (
          <div className="rounded-2xl border border-[#B96F78]/15 bg-[#B96F78]/[0.04] p-4">
            <p className="text-sm font-extrabold text-[#38323F]">
              Couldn&apos;t load recent check-ins
            </p>
            <p className="mt-1 text-xs leading-5 text-[#817C86]">
              The rest of your Progress page can still be used.
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-xl bg-[#7482A4] px-3 py-2 text-xs font-extrabold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
            >
              Retry
            </button>
          </div>
        ) : logs.length === 0 ? (
          <ProgressEmptyState
            title={search.trim() ? 'No matching check-ins' : 'No check-ins yet'}
            description={
              search.trim()
                ? 'Try another search term or clear the search.'
                : 'Log your first weight or body-fat update to start building your progress history.'
            }
            icon={CalendarDays}
            actionLabel={search.trim() ? undefined : 'Log Check-In'}
            onAction={search.trim() ? undefined : onLogCheckIn}
            compact
          />
        ) : (
          <ProgressLogCollection logs={logs} onDelete={onDelete} />
        )}
      </div>
    </section>
  )
}
