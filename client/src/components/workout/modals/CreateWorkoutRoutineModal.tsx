import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Dumbbell,
  Plus,
  Search,
  Timer,
  Trash2,
  X,
} from 'lucide-react'
import type {
  CreateWorkoutRoutineInput,
  WorkoutExercise,
} from '../../../services/types/workout'

interface CreateWorkoutRoutineModalProps {
  open: boolean
  exercises: WorkoutExercise[]
  isSubmitting: boolean
  onClose: () => void
  onCreate: (input: CreateWorkoutRoutineInput) => Promise<void>
}

interface RoutineDraftExercise {
  exercise: WorkoutExercise
  target_sets: number
  target_reps_min: number
  target_reps_max: number
  rest_seconds: number
  notes: string
}

const DEFAULT_SETS = 3
const DEFAULT_REPS_MIN = 8
const DEFAULT_REPS_MAX = 12
const DEFAULT_REST_SECONDS = 120

const clampWholeNumber = (value: number, minimum: number) =>
  Number.isFinite(value) ? Math.max(minimum, Math.round(value)) : minimum

const formatRest = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(safeSeconds / 60)
  const remaining = safeSeconds % 60
  return `${minutes}:${remaining.toString().padStart(2, '0')}`
}

export function CreateWorkoutRoutineModal({
  open,
  exercises,
  isSubmitting,
  onClose,
  onCreate,
}: CreateWorkoutRoutineModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<RoutineDraftExercise[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setName('')
    setDescription('')
    setSearch('')
    setSelected([])
    setError('')
  }, [open])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, isSubmitting, onClose])

  const selectedIds = useMemo(
    () => new Set(selected.map((item) => item.exercise.id)),
    [selected]
  )

  const filteredExercises = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return exercises

    return exercises.filter((exercise) =>
      [exercise.name, exercise.category, exercise.equipment]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    )
  }, [exercises, search])

  if (!open) return null

  const addExercise = (exercise: WorkoutExercise) => {
    if (selectedIds.has(exercise.id)) return

    setSelected((current) => [
      ...current,
      {
        exercise,
        target_sets: DEFAULT_SETS,
        target_reps_min: DEFAULT_REPS_MIN,
        target_reps_max: DEFAULT_REPS_MAX,
        rest_seconds: DEFAULT_REST_SECONDS,
        notes: '',
      },
    ])
    setError('')
  }

  const updateExercise = (
    index: number,
    patch: Partial<Omit<RoutineDraftExercise, 'exercise'>>
  ) => {
    setSelected((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      )
    )
  }

  const removeExercise = (index: number) => {
    setSelected((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  const moveExercise = (index: number, direction: -1 | 1) => {
    setSelected((current) => {
      const targetIndex = index + direction
      if (targetIndex < 0 || targetIndex >= current.length) return current

      const next = [...current]
      const [item] = next.splice(index, 1)
      next.splice(targetIndex, 0, item)
      return next
    })
  }

  const submit = async () => {
    const cleanName = name.trim()

    if (!cleanName) {
      setError('Routine name is required.')
      return
    }

    if (selected.length === 0) {
      setError('Add at least one exercise to the routine.')
      return
    }

    const invalidExercise = selected.find(
      (item) =>
        item.target_sets < 1 ||
        item.target_reps_min < 1 ||
        item.target_reps_max < item.target_reps_min ||
        item.rest_seconds < 0
    )

    if (invalidExercise) {
      setError('Check sets, rep range, and rest time for every exercise.')
      return
    }

    setError('')

    try {
      await onCreate({
        name: cleanName,
        description: description.trim() || undefined,
        exercises: selected.map((item, index) => ({
          exercise_id: item.exercise.id,
          target_sets: clampWholeNumber(item.target_sets, 1),
          target_reps_min: clampWholeNumber(item.target_reps_min, 1),
          target_reps_max: Math.max(
            clampWholeNumber(item.target_reps_max, 1),
            clampWholeNumber(item.target_reps_min, 1)
          ),
          rest_seconds: clampWholeNumber(item.rest_seconds, 0),
          notes: item.notes.trim() || null,
          order_index: index + 1,
        })),
      })
    } catch {
      // Parent keeps the modal open and surfaces the API error through the global toast.
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-[#27232B]/50 p-4 backdrop-blur-[2px] sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-routine-title"
        className="flex h-[min(680px,calc(100vh-48px))] w-full max-w-[960px] flex-col overflow-hidden rounded-[26px] bg-white shadow-[0_28px_80px_rgba(25,22,30,0.22)] sm:h-[min(680px,calc(100vh-64px))]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#EEEAF0] px-5 py-4 sm:px-6 sm:py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7482A4]">
              New Workout Routine
            </p>
            <h2
              id="create-routine-title"
              className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-[#38323F]"
            >
              Build your workout routine
            </h2>
            <p className="mt-1 text-sm text-[#817B85]">
              Choose exercises, then set your sets, reps, and rest time.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close create routine modal"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F5F3F6] text-[#6F6A74] transition hover:bg-[#ECE9EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="text-xs font-bold text-[#5F5963]">Routine name *</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Anterior A"
                className="mt-2 h-11 w-full rounded-xl border border-[#DED9E1] px-3.5 text-sm text-[#38323F] outline-none transition placeholder:text-[#AAA5AF] focus:border-[#7482A4] focus:ring-4 focus:ring-[#7482A4]/10"
              />
            </label>

            <label>
              <span className="text-xs font-bold text-[#5F5963]">Description</span>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="e.g. Push + Quads + Core"
                className="mt-2 h-11 w-full rounded-xl border border-[#DED9E1] px-3.5 text-sm text-[#38323F] outline-none transition placeholder:text-[#AAA5AF] focus:border-[#7482A4] focus:ring-4 focus:ring-[#7482A4]/10"
              />
            </label>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="rounded-[20px] border border-[#EAE7EC] bg-[#FAF9FB] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-[#38323F]">Exercise library</h3>
                  <p className="mt-1 text-xs text-[#8B8690]">Add each exercise once.</p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#7482A4] shadow-sm">
                  {exercises.length} available
                </span>
              </div>

              <label className="relative mt-4 block">
                <span className="sr-only">Search exercises</span>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A95A0]" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search exercise, muscle, equipment..."
                  className="h-11 w-full rounded-xl border border-[#DED9E1] bg-white pl-10 pr-3 text-sm text-[#38323F] outline-none focus:border-[#7482A4] focus:ring-4 focus:ring-[#7482A4]/10"
                />
              </label>

              <div className="mt-3 space-y-2">
                {filteredExercises.length > 0 ? (
                  filteredExercises.map((exercise) => {
                    const alreadyAdded = selectedIds.has(exercise.id)

                    return (
                      <div
                        key={exercise.id}
                        className="flex items-center gap-3 rounded-2xl border border-[#EAE7EC] bg-white p-3"
                      >
                        <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#F2F3F7] text-[#7482A4]">
                          {exercise.image_url ? (
                            <img
                              src={exercise.image_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Dumbbell className="h-5 w-5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[#38323F]">
                            {exercise.name}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-[#8B8690]">
                            {exercise.category} · {exercise.equipment}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => addExercise(exercise)}
                          disabled={alreadyAdded}
                          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-[#D7DAE3] px-3 text-xs font-bold text-[#7482A4] transition hover:bg-[#F3F4F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] disabled:cursor-default disabled:border-transparent disabled:bg-[#F5F3F6] disabled:text-[#AAA5AE]"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {alreadyAdded ? 'Added' : 'Add'}
                        </button>
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#DCD8E1] bg-white px-4 py-8 text-center">
                    <Dumbbell className="mx-auto h-7 w-7 text-[#7482A4]" />
                    <p className="mt-3 text-sm font-bold text-[#38323F]">
                      {exercises.length === 0
                        ? 'No exercises available yet'
                        : 'No matching exercises'}
                    </p>
                    <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[#8B8690]">
                      {exercises.length === 0
                        ? 'Create exercises first, then return here to build your routine.'
                        : 'Try another exercise name, category, or equipment.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-[#38323F]">Routine exercises</h3>
                  <p className="mt-1 text-xs text-[#8B8690]">
                    Exercises run from top to bottom during the workout.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#7482A4]">
                  {selected.length} selected
                </span>
              </div>

              {selected.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {selected.map((item, index) => (
                    <article
                      key={item.exercise.id}
                      className="rounded-[18px] border border-[#EAE7EC] bg-white p-4 shadow-[0_4px_16px_rgba(56,50,63,0.035)]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F2F3F7] text-xs font-extrabold text-[#7482A4]">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-extrabold text-[#38323F]">
                            {item.exercise.name}
                          </p>
                          <p className="mt-0.5 text-[11px] text-[#8B8690]">
                            {item.exercise.category} · {item.exercise.equipment}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveExercise(index, -1)}
                            disabled={index === 0}
                            aria-label={`Move ${item.exercise.name} up`}
                            className="grid h-8 w-8 place-items-center rounded-lg text-[#8B8690] transition hover:bg-[#F5F3F6] disabled:opacity-30"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveExercise(index, 1)}
                            disabled={index === selected.length - 1}
                            aria-label={`Move ${item.exercise.name} down`}
                            className="grid h-8 w-8 place-items-center rounded-lg text-[#8B8690] transition hover:bg-[#F5F3F6] disabled:opacity-30"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeExercise(index)}
                            aria-label={`Remove ${item.exercise.name}`}
                            className="grid h-8 w-8 place-items-center rounded-lg text-[#B96F78] transition hover:bg-[#FBF1F3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B96F78]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <label className="rounded-xl bg-[#F8F7FA] p-2.5">
                          <span className="text-[10px] font-bold text-[#8B8690]">Sets</span>
                          <input
                            type="number"
                            min="1"
                            value={item.target_sets}
                            onChange={(event) =>
                              updateExercise(index, {
                                target_sets: Number(event.target.value),
                              })
                            }
                            className="mt-1 w-full bg-transparent text-sm font-extrabold text-[#38323F] outline-none"
                          />
                        </label>

                        <label className="rounded-xl bg-[#F8F7FA] p-2.5">
                          <span className="text-[10px] font-bold text-[#8B8690]">Min reps</span>
                          <input
                            type="number"
                            min="1"
                            value={item.target_reps_min}
                            onChange={(event) =>
                              updateExercise(index, {
                                target_reps_min: Number(event.target.value),
                              })
                            }
                            className="mt-1 w-full bg-transparent text-sm font-extrabold text-[#38323F] outline-none"
                          />
                        </label>

                        <label className="rounded-xl bg-[#F8F7FA] p-2.5">
                          <span className="text-[10px] font-bold text-[#8B8690]">Max reps</span>
                          <input
                            type="number"
                            min="1"
                            value={item.target_reps_max}
                            onChange={(event) =>
                              updateExercise(index, {
                                target_reps_max: Number(event.target.value),
                              })
                            }
                            className="mt-1 w-full bg-transparent text-sm font-extrabold text-[#38323F] outline-none"
                          />
                        </label>

                        <label className="rounded-xl bg-[#F8F7FA] p-2.5">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[#8B8690]">
                            <Timer className="h-3 w-3" /> Rest sec
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="15"
                            value={item.rest_seconds}
                            onChange={(event) =>
                              updateExercise(index, {
                                rest_seconds: Number(event.target.value),
                              })
                            }
                            className="mt-1 w-full bg-transparent text-sm font-extrabold text-[#38323F] outline-none"
                          />
                        </label>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-3 text-[10px] text-[#9A949E]">
                        <span>
                          Target: {item.target_sets} × {item.target_reps_min}–{item.target_reps_max}
                        </span>
                        <span>Rest {formatRest(item.rest_seconds)}</span>
                      </div>

                      <label className="mt-3 block">
                        <span className="text-[10px] font-bold text-[#8B8690]">Notes</span>
                        <input
                          value={item.notes}
                          onChange={(event) =>
                            updateExercise(index, { notes: event.target.value })
                          }
                          placeholder="Optional cue or note"
                          className="mt-1.5 h-9 w-full rounded-xl border border-[#E5E1E7] px-3 text-xs text-[#38323F] outline-none focus:border-[#7482A4] focus:ring-4 focus:ring-[#7482A4]/10"
                        />
                      </label>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-3 rounded-[20px] border border-dashed border-[#DCD8E1] bg-[#FAF9FB] px-5 py-12 text-center">
                  <Dumbbell className="mx-auto h-8 w-8 text-[#7482A4]" />
                  <p className="mt-3 text-sm font-extrabold text-[#38323F]">No exercises added yet</p>
                  <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#8B8690]">
                    Pick exercises from the library to build this workout routine.
                  </p>
                </div>
              )}
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl bg-[#FBF1F3] px-3.5 py-2.5 text-xs font-semibold text-[#A65C66]">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-[#EEEAF0] bg-white px-5 py-4 sm:flex-row sm:justify-between sm:px-6">
          <p className="self-center text-xs text-[#8B8690]">
            {selected.length > 0
              ? `${selected.length} exercise${selected.length === 1 ? '' : 's'} · changes save with the routine`
              : 'Add at least one exercise to continue.'}
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-[#DED9E1] px-4 py-2.5 text-sm font-bold text-[#5F5963] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={isSubmitting || exercises.length === 0}
              className="rounded-xl bg-[#7482A4] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#667493] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Routine'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
