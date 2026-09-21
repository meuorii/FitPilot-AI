import { ArrowRight, Clock3, Dumbbell, Layers3, Play } from 'lucide-react'
import roccoWorkoutHero from '../../assets/images/rocco-workout-hero.png'
import type {
  WorkoutRoutine,
  WorkoutSessionDetails,
} from '../../services/types/workout'

interface WorkoutHeroProps {
  routine: WorkoutRoutine | null
  activeSession: WorkoutSessionDetails | null
  isRestDay: boolean
  hasSplits: boolean
  hasRoutines: boolean
  isStarting: boolean
  onStart: () => void
  onOpenActive: () => void
  onManageSplit: () => void
  onCreateRoutine: () => void
}

const getRoutineMetrics = (routine: WorkoutRoutine | null) => {
  if (!routine) {
    return { exercises: 0, sets: 0, minutes: 0 }
  }

  const exercises = routine.routine_exercises.length
  const sets = routine.routine_exercises.reduce(
    (total, item) => total + Math.max(item.target_sets, 0),
    0
  )
  const seconds = routine.routine_exercises.reduce((total, item) => {
    const setWorkSeconds = Math.max(item.target_sets, 0) * 45
    const restSeconds =
      Math.max(item.target_sets - 1, 0) * Math.max(item.rest_seconds, 0)
    return total + setWorkSeconds + restSeconds
  }, 0)

  return {
    exercises,
    sets,
    minutes: seconds > 0 ? Math.max(1, Math.ceil(seconds / 60)) : 0,
  }
}

export function WorkoutHero({
  routine,
  activeSession,
  isRestDay,
  hasSplits,
  hasRoutines,
  isStarting,
  onStart,
  onOpenActive,
  onManageSplit,
  onCreateRoutine,
}: WorkoutHeroProps) {
  const metrics = getRoutineMetrics(routine)
  const hasActiveSession = Boolean(activeSession)

  const title = isRestDay
    ? 'Recovery is part of the plan.'
    : routine
      ? 'Ready to train today?'
      : !hasRoutines
        ? 'Build your first workout routine'
        : hasSplits
          ? 'No workout planned for today.'
          : 'Build your first workout plan'

  const supportingCopy = isRestDay
    ? 'Use today to recover well so you can come back stronger.'
    : routine
      ? 'Stay focused. Log every set. Rest. Repeat.'
      : !hasRoutines
        ? 'Group your exercises into a routine, then assign that routine to your weekly split.'
        : hasSplits
          ? 'Adjust your active split when you want to train on a different day.'
          : 'You already have a routine. Create a workout split and assign it to your training days.'

  const ctaLabel = hasActiveSession
    ? 'Continue Workout'
    : routine
      ? 'Start Workout'
      : !hasRoutines
        ? 'Create Routine'
        : hasSplits
          ? 'Manage Workout Split'
          : 'Create Workout Split'

  const handlePrimaryAction = () => {
    if (hasActiveSession) {
      onOpenActive()
      return
    }

    if (routine && !isRestDay) {
      onStart()
      return
    }

    if (!hasRoutines) {
      onCreateRoutine()
      return
    }

    onManageSplit()
  }

  return (
    <section className="relative isolate min-h-[350px] overflow-hidden rounded-[24px] bg-gradient-to-br from-[#667493] via-[#7482A4] to-[#8F9AB7] p-6 text-white shadow-[0_16px_36px_rgba(56,50,63,0.12)] sm:p-7 lg:min-h-[390px] lg:p-8">
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[44px] border-white/20" />
        <div className="absolute bottom-8 right-[32%] h-36 w-36 rotate-12 rounded-[42px] bg-white/10" />
        <div className="absolute left-[48%] top-10 h-2 w-2 rounded-full bg-white/70 shadow-[24px_0_0_rgba(255,255,255,.7),48px_0_0_rgba(255,255,255,.7),72px_0_0_rgba(255,255,255,.7),0_24px_0_rgba(255,255,255,.7),24px_24px_0_rgba(255,255,255,.7),48px_24px_0_rgba(255,255,255,.7),72px_24px_0_rgba(255,255,255,.7)]" />
      </div>

      <div className="relative z-10 max-w-[62%] sm:max-w-[58%] lg:max-w-[60%]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
          FitPilot Training
        </p>
        <h2 className="mt-2 text-3xl font-extrabold leading-[1.04] tracking-[-0.04em] sm:text-4xl lg:text-[44px]">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/85 sm:text-base">
          {supportingCopy}
        </p>

        <div className="mt-6">
          <p className="text-xs font-semibold text-white/70">Today&apos;s Routine</p>
          <p className="mt-1 line-clamp-2 text-lg font-extrabold sm:text-xl">
            {routine?.name ?? (isRestDay ? 'Rest Day' : 'No routine assigned')}
          </p>
        </div>

        {routine && !isRestDay ? (
          <div className="mt-6 grid max-w-[520px] grid-cols-1 gap-3 text-white sm:grid-cols-3">
            <div className="flex items-center gap-2.5 border-white/20 sm:border-r">
              <Dumbbell className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-lg font-extrabold leading-none">{metrics.exercises}</p>
                <p className="mt-1 text-[11px] text-white/75">Exercises</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 border-white/20 sm:border-r sm:px-3">
              <Layers3 className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-lg font-extrabold leading-none">{metrics.sets}</p>
                <p className="mt-1 text-[11px] text-white/75">Sets</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 sm:pl-3">
              <Clock3 className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-lg font-extrabold leading-none">
                  ~{metrics.minutes} min
                </p>
                <p className="mt-1 text-[11px] text-white/75">Estimated time</p>
              </div>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handlePrimaryAction}
          disabled={isStarting}
          className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#667493] shadow-[0_10px_24px_rgba(56,50,63,0.14)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(56,50,63,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#7482A4] disabled:cursor-not-allowed disabled:opacity-70 sm:px-6"
        >
          {hasActiveSession ? <Play className="h-4 w-4 fill-current" /> : null}
          {isStarting ? 'Starting...' : ctaLabel}
          {!isStarting ? <ArrowRight className="h-4 w-4" /> : null}
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-0 right-[-4%] z-0 h-[92%] w-[48%] sm:right-[1%] sm:w-[44%] lg:right-[2%] lg:w-[42%]">
        <img
          src={roccoWorkoutHero}
          alt="Rocco, the FitPilot wolf mascot, ready for a workout"
          className="h-full w-full object-contain object-bottom"
          draggable={false}
        />
      </div>
    </section>
  )
}
