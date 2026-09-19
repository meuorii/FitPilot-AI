import { ArrowRight, CheckCircle2, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";
import type { DashboardWorkout } from "../../services/types/dashboard";

interface TodayWorkoutCardProps {
  workout: DashboardWorkout | null;
}

export function TodayWorkoutCard({ workout }: TodayWorkoutCardProps) {
  if (!workout) {
    return (
      <section className="rounded-[24px] border border-[#EAE7EC] bg-white p-5 shadow-[0_8px_30px_rgba(56,50,63,0.04)]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#38323F]">Today&apos;s Workout</h2>
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#7482A4]/10 text-[#7482A4]">
            <Dumbbell className="h-5 w-5" />
          </span>
        </div>

        <div className="mt-8 flex flex-col items-center py-5 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#F5F3F6] text-[#7482A4]">
            <Dumbbell className="h-6 w-6" />
          </div>
          <p className="mt-4 font-extrabold text-[#38323F]">No workout started yet</p>
          <p className="mt-1 max-w-xs text-sm leading-6 text-[#85808A]">
            Pick a routine and start your first exercise.
          </p>
          <Link
            to="/workouts"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#38323F] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#4A4350] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2"
          >
            Start Workout
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  const completed = workout.status === "completed";
  const ctaLabel = completed ? "View Workout" : "Continue Workout";

  return (
    <section className="rounded-[24px] border border-[#EAE7EC] bg-white p-5 shadow-[0_8px_30px_rgba(56,50,63,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8A858F]">Today&apos;s Workout</p>
          <h2 className="mt-2 text-xl font-extrabold text-[#38323F]">{workout.routine_name}</h2>
          <p className="mt-1 text-sm capitalize text-[#85808A]">{workout.status.replaceAll("_", " ")}</p>
        </div>
        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${completed ? "bg-emerald-50 text-emerald-600" : "bg-[#7482A4]/10 text-[#7482A4]"}`}>
          {completed ? <CheckCircle2 className="h-5 w-5" /> : <Dumbbell className="h-5 w-5" />}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <WorkoutStat label="Exercises" value={`${workout.exercises_completed} / ${workout.total_exercises}`} />
        <WorkoutStat label="Sets" value={`${workout.sets_completed} / ${workout.total_sets}`} />
        <WorkoutStat label="Volume" value={`${workout.total_volume_kg.toLocaleString()} kg`} />
      </div>

      <Link
        to="/workouts"
        className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#657394] hover:text-[#4F5A73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2"
      >
        {ctaLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

function WorkoutStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F8F7F9] p-3">
      <p className="text-[11px] font-semibold text-[#918C96]">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-[#38323F]">{value}</p>
    </div>
  );
}
