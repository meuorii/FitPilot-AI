import type { DashboardMetric } from "../../services/types/dashboard";

interface MacroCardProps {
  label: string;
  metric: DashboardMetric;
  unit: "kcal" | "g";
}

function formatMetricValue(value: number, unit: "kcal" | "g") {
  return unit === "g" ? `${value.toLocaleString()}g` : `${value.toLocaleString()} kcal`;
}

export function MacroCard({ label, metric, unit }: MacroCardProps) {
  const fill = Math.min(100, Math.max(0, metric.percentage));
  const exceeded = metric.exceeded > 0;

  return (
    <article className="rounded-[22px] border border-[#EAE7EC] bg-white p-4 shadow-[0_8px_30px_rgba(56,50,63,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#38323F]">{label}</p>
          <p className="mt-1 text-xs text-[#8B8690]">
            {formatMetricValue(metric.consumed, unit)} / {formatMetricValue(metric.target, unit)}
          </p>
        </div>
        <span className="rounded-full bg-[#F5F3F6] px-2.5 py-1 text-xs font-bold text-[#6B6570]">
          {Math.round(metric.percentage)}%
        </span>
      </div>

      <div
        className="mt-5 h-2.5 overflow-hidden rounded-full bg-[#EEECEF]"
        aria-label={`${label} progress ${Math.round(metric.percentage)} percent`}
      >
        <div
          className="h-full rounded-full bg-[#7482A4] transition-[width] duration-500"
          style={{ width: `${fill}%` }}
        />
      </div>

      <p className={`mt-3 text-xs font-semibold ${exceeded ? "text-[#9A5E62]" : "text-[#77727B]"}`}>
        {exceeded
          ? `${formatMetricValue(metric.exceeded, unit)} over target`
          : `${formatMetricValue(Math.max(0, metric.remaining), unit)} remaining`}
      </p>
    </article>
  );
}
