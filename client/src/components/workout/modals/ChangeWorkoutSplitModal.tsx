import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import type { WorkoutSplit } from '../../../services/types/workout'

interface ChangeWorkoutSplitModalProps {
  open: boolean
  splits: WorkoutSplit[]
  currentSplitId: string | null
  isSubmitting: boolean
  onClose: () => void
  onConfirm: (splitId: string) => Promise<void>
}

export function ChangeWorkoutSplitModal({
  open,
  splits,
  currentSplitId,
  isSubmitting,
  onClose,
  onConfirm,
}: ChangeWorkoutSplitModalProps) {
  const [selectedId, setSelectedId] = useState(currentSplitId ?? '')

  useEffect(() => {
    if (open) setSelectedId(currentSplitId ?? '')
  }, [open, currentSplitId])

  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, isSubmitting, onClose])

  if (!open) return null

  const unchanged = !selectedId || selectedId === currentSplitId

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-[#27232B]/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose()
      }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="change-split-title" className="w-full max-w-lg rounded-[24px] bg-white p-5 shadow-[0_28px_80px_rgba(25,22,30,0.22)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7482A4]">Workout Split</p>
            <h2 id="change-split-title" className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-[#38323F]">Change active split</h2>
            <p className="mt-2 text-sm leading-6 text-[#817B85]">Choose which weekly split FitPilot should use for your current training schedule.</p>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting} aria-label="Close" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F5F3F6] text-[#6F6A74] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] disabled:opacity-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 max-h-[340px] space-y-2 overflow-y-auto pr-1">
          {splits.length ? splits.map((split) => {
            const selected = selectedId === split.id
            return (
              <button key={split.id} type="button" onClick={() => setSelectedId(split.id)} className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] ${selected ? 'border-[#7482A4] bg-[#F2F3F7]' : 'border-[#EAE7EC] hover:bg-[#FAF9FB]'}`}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-[#38323F]">{split.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#8B8690]">{split.description || 'No description provided.'}</p>
                </div>
                <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border ${selected ? 'border-[#7482A4] bg-[#7482A4] text-white' : 'border-[#D8D4DC] text-transparent'}`}>
                  <Check className="h-4 w-4" />
                </div>
              </button>
            )
          }) : (
            <div className="rounded-2xl border border-dashed border-[#DCD8E1] bg-[#FAF9FB] p-6 text-center text-sm text-[#817B85]">No workout splits are available yet.</div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-xl border border-[#DED9E1] px-4 py-2.5 text-sm font-bold text-[#5F5963] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] disabled:opacity-50">Cancel</button>
          <button type="button" onClick={() => onConfirm(selectedId)} disabled={unchanged || isSubmitting} className="rounded-xl bg-[#7482A4] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#667493] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            {isSubmitting ? 'Applying...' : 'Apply Split'}
          </button>
        </div>
      </section>
    </div>
  )
}
