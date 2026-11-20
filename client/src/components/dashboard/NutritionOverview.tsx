import type { DashboardNutrition } from "../../services/types/dashboard";
import { MacroCard } from "./MacroCard";

interface NutritionOverviewProps {
  nutrition: DashboardNutrition;
}

export function NutritionOverview({ nutrition }: NutritionOverviewProps) {
  return (
    <section className="dashboard-nutrition-card rounded-[24px] border border-[#EAE7EC] bg-white p-5 shadow-[0_8px_30px_rgba(56,50,63,0.04)]">
      <div className="dashboard-nutrition-card__header">
        <div>
          <h2 className="text-lg font-extrabold text-[#38323F]">Calories &amp; Macros</h2>
          <p className="mt-1 text-xs text-[#8A858F]">Daily nutrition progress from your logged meals.</p>
        </div>
        <p className="shrink-0 text-xs font-bold text-[#6C6670]">
          Meals Logged: {nutrition.meals_logged}
        </p>
      </div>

      <div className="dashboard-nutrition-card__grid">
        <MacroCard label="Calories" metric={nutrition.calories} unit="kcal" />
        <MacroCard label="Protein" metric={nutrition.protein} unit="g" />
        <MacroCard label="Carbs" metric={nutrition.carbs} unit="g" />
        <MacroCard label="Fat" metric={nutrition.fat} unit="g" />
      </div>
    </section>
  );
}
