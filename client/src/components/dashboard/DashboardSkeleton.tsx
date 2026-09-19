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
      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Block className="h-72 w-full" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Block key={i} className="h-36 w-full" />)}
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <Block className="h-80 w-full" />
            <Block className="h-80 w-full" />
          </div>
        </div>
        <div className="space-y-5">
          <Block className="h-80 w-full" />
          <Block className="h-72 w-full" />
          <Block className="h-80 w-full" />
        </div>
      </div>
    </div>
  );
}
