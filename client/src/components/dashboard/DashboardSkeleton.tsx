function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-[22px] bg-[#E9E6EB] ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading dashboard">
      <div className="flex items-center justify-between gap-5">
        <div className="space-y-2">
          <Block className="h-8 w-56" />
          <Block className="h-4 w-44" />
        </div>
        <Block className="h-11 w-44 sm:w-80" />
      </div>
      <div className="dashboard-dashboard__skeleton">
        <Block className="dashboard-dashboard__skeleton-hero min-h-72 w-full" />
        <Block className="dashboard-dashboard__skeleton-nutrition min-h-72 w-full" />
        <Block className="dashboard-dashboard__skeleton-calendar min-h-80 w-full" />
        <Block className="dashboard-dashboard__skeleton-activity min-h-80 w-full" />
        <Block className="dashboard-dashboard__skeleton-plan min-h-72 w-full" />
        <Block className="dashboard-dashboard__skeleton-workout min-h-72 w-full" />
        <Block className="dashboard-dashboard__skeleton-summary min-h-80 w-full" />
      </div>
    </div>
  );
}
