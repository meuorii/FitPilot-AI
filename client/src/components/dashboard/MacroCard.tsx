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
  const percentageLabel = `${Math.round(metric.percentage)}%`;
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (fill / 100) * circumference;

  return (
    <article className="dashboard-macro-card">
      <div className="dashboard-macro-card__topline">
        <p className="text-sm font-bold text-[#38323F]">{label}</p>
        <div
          className="dashboard-macro-ring"
          role="progressbar"
          aria-label={`${label} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={fill}
          aria-valuetext={`${percentageLabel}, ${formatMetricValue(metric.consumed, unit)} of ${formatMetricValue(metric.target, unit)}`}
        >
          <svg viewBox="0 0 80 80" aria-hidden="true">
            <circle className="dashboard-macro-ring__track" cx="40" cy="40" r={radius} />
            <circle
              className="dashboard-macro-ring__value"
              cx="40"
              cy="40"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <span>{percentageLabel}</span>
        </div>
      </div>

      <p className="dashboard-macro-card__amount">
        {formatMetricValue(metric.consumed, unit)} / {formatMetricValue(metric.target, unit)}
      </p>

      <p className={`dashboard-macro-card__remaining ${exceeded ? "is-exceeded" : ""}`}>
        {exceeded
          ? `${formatMetricValue(metric.exceeded, unit)} over target`
          : `${formatMetricValue(Math.max(0, metric.remaining), unit)} remaining`}
      </p>
    </article>
  );
}
