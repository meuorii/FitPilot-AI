import { useEffect, useMemo, useState } from 'react'
import { Dumbbell, Plus, X } from 'lucide-react'
import type {
  CreateWorkoutSplitInput,
  WorkoutRoutine,
} from '../../../services/types/workout'

interface CreateWorkoutSplitModalProps {
  open: boolean
  routines: WorkoutRoutine[]
  isSubmitting: boolean
  onClose: () => void
  onCreate: (input: CreateWorkoutSplitInput) => Promise<void>
  onCreateRoutine: () => void
}

const days = [
  { index: 1, label: 'Monday' },
  { index: 2, label: 'Tuesday' },
  { index: 3, label: 'Wednesday' },
  { index: 4, label: 'Thursday' },
  { index: 5, label: 'Friday' },
  { index: 6, label: 'Saturday' },
  { index: 0, label: 'Sunday' },
]

export function CreateWorkoutSplitModal({
  open,
  routines,
  isSubmitting,
  onClose,
  onCreate,
  onCreateRoutine,
}: CreateWorkoutSplitModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [assignments, setAssignments] = useState<Record<number, string>>({})
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setName('')
    setDescription('')
    setAssignments({})
    setError('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, isSubmitting, onClose])

  const activeDays = useMemo(
    () => Object.values(assignments).filter(Boolean).length,
    [assignments]
  )

  if (!open) return null

  const submit = async () => {
    const cleanName = name.trim()
    if (!cleanName) {
      setError('Split name is required.')
      return
    }
    if (activeDays === 0) {
      setError('Assign at least one routine to a training day.')
      return
    }

    setError('')
    try {
      await onCreate({
        name: cleanName,
        description: description.trim() || undefined,
        is_active: true,
        days: days.map((day, orderIndex) => {
          const routineId = assignments[day.index]
          return {
            day_of_week: day.index,
            routine_id: routineId || null,
            is_rest_day: !routineId,
            order_index: orderIndex,
          }
        }),
      })
    } catch {
      // Parent keeps the modal open and surfaces the API error through the global toast.
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-[#27232B]/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-split-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[24px] bg-white p-5 shadow-[0_28px_80px_rgba(25,22,30,0.22)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7482A4]">
              New Workout Split
            </p>
            <h2
              id="create-split-title"
              className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-[#38323F]"
            >
              Build your weekly schedule
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F5F3F6] text-[#6F6A74] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {routines.length === 0 ? (
          <div className="mt-6 rounded-[20px] border border-dashed border-[#DCD8E1] bg-[#FAF9FB] px-6 py-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-[#7482A4] shadow-sm">
              <Dumbbell className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-extrabold text-[#38323F]">
              Create a routine first
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#817B85]">
              A routine is the group of exercises, sets, reps, and rest times that you assign to a workout day.
            </p>
            <button
              type="button"
              onClick={onCreateRoutine}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#7482A4] px-5 text-sm font-extrabold text-white transition hover:bg-[#667493] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              Create Your First Routine
            </button>
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-1">
                <span className="text-xs font-bold text-[#5F5963]">Split name *</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Anterior / Posterior"
                  className="mt-2 h-11 w-full rounded-xl border border-[#DED9E1] px-3.5 text-sm outline-none focus:border-[#7482A4] focus:ring-4 focus:ring-[#7482A4]/10"
                />
              </label>
              <label className="sm:col-span-1">
                <span className="text-xs font-bold text-[#5F5963]">Description</span>
                <input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Optional description"
                  className="mt-2 h-11 w-full rounded-xl border border-[#DED9E1] px-3.5 text-sm outline-none focus:border-[#7482A4] focus:ring-4 focus:ring-[#7482A4]/10"
                />
              </label>
            </div>

            <div className="mt-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-[#38323F]">Training days</p>
                  <p className="mt-1 text-xs text-[#8B8690]">
                    Leave a day unassigned to make it a rest day.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#7482A4]">
                  {activeDays} active
                </span>
              </div>

              <div className="mt-3 divide-y divide-[#F0EDF2] overflow-hidden rounded-2xl border border-[#EAE7EC]">
                {days.map((day) => (
                  <label
                    key={day.index}
                    className="grid grid-cols-[110px_1fr] items-center gap-3 bg-white px-4 py-3 sm:grid-cols-[140px_1fr]"
                  >
                    <span className="text-xs font-bold text-[#5F5963]">
                      {day.label}
                    </span>
                    <select
                      value={assignments[day.index] ?? ''}
                      onChange={(event) =>
                        setAssignments((current) => ({
                          ...current,
                          [day.index]: event.target.value,
                        }))
                      }
                      className="h-10 min-w-0 rounded-xl border border-[#DED9E1] bg-white px-3 text-xs text-[#38323F] outline-none focus:border-[#7482A4] focus:ring-4 focus:ring-[#7482A4]/10"
                    >
                      <option value="">Rest day</option>
                      {routines.map((routine) => (
                        <option key={routine.id} value={routine.id}>
                          {routine.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onCreateRoutine}
              className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-[#7482A4] transition hover:text-[#5E6D91] focus-visible:outline-none focus-visible:underline"
            >
              <Plus className="h-4 w-4" />
              Create another routine
            </button>
          </>
        )}

        {error ? (
          <p className="mt-3 text-xs font-semibold text-[#B96F78]">{error}</p>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-[#DED9E1] px-4 py-2.5 text-sm font-bold text-[#5F5963] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] disabled:opacity-50"
          >
            Cancel
          </button>
          {routines.length > 0 ? (
            <button
              type="button"
              onClick={submit}
              disabled={isSubmitting}
              className="rounded-xl bg-[#7482A4] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#667493] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Split'}
            </button>
          ) : null}
        </div>
      </section>
    </div>
  )
}
