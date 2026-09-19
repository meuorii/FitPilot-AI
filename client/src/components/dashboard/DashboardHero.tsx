import { ArrowRight, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import roccoDashboard from "../../assets/images/rocco-dashboard.png";
import type { DashboardNutrition } from "../../services/types/dashboard";

interface DashboardHeroProps {
  nutrition: DashboardNutrition;
}

function remainingLabel(remaining: number, exceeded: number, unit: string) {
  if (exceeded > 0) return `${exceeded.toLocaleString()}${unit} over`;
  return `${Math.max(0, remaining).toLocaleString()}${unit} left`;
}

export function DashboardHero({ nutrition }: DashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#7482A4] via-[#667493] to-[#55617C] p-6 text-white shadow-sm sm:p-8">
      <div className="relative z-10 max-w-[62%] sm:max-w-[66%]">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
          <Flame className="h-4 w-4" />
          TODAY'S FOCUS
        </div>
        <h2 className="max-w-xl text-2xl font-extrabold tracking-tight sm:text-3xl">
          Let&apos;s crush today&apos;s goals!
        </h2>
        <p className="mt-2 text-sm text-white/80 sm:text-base">Focus. Fuel. Finish strong.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm">
            <p className="text-xs font-semibold text-white/70">Calories remaining</p>
            <p className="mt-1 text-xl font-extrabold">
              {remainingLabel(
                nutrition.calories.remaining,
                nutrition.calories.exceeded,
                " kcal",
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm">
            <p className="text-xs font-semibold text-white/70">Protein left</p>
            <p className="mt-1 text-xl font-extrabold">
              {remainingLabel(
                nutrition.protein.remaining,
                nutrition.protein.exceeded,
                "g",
              )}
            </p>
          </div>
        </div>

        <Link
          to="/meals"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-[#53607D] transition hover:bg-[#F5F3F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#667493]"
        >
          View Today&apos;s Plan
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[40%] items-end justify-end sm:w-[38%]">
        <div className="absolute -right-10 top-3 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <img
          src={roccoDashboard}
          alt="Rocco, the FitPilot wolf mascot"
          className="relative max-h-[92%] w-full max-w-[260px] object-contain object-bottom"
        />
      </div>
    </section>
  );
}
