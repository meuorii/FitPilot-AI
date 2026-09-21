const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-2xl bg-[#E9E6EC] ${className}`} />
)

export function WorkoutSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading workout page" aria-busy="true">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-[min(520px,70vw)]" />
        </div>
        <Skeleton className="hidden h-11 w-80 sm:block" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.72fr)_minmax(330px,1fr)]">
        <Skeleton className="h-[390px]" />
        <Skeleton className="h-[390px]" />
        <Skeleton className="h-[420px]" />
        <Skeleton className="h-[420px]" />
        <Skeleton className="h-[260px]" />
        <Skeleton className="h-[260px]" />
      </div>
    </div>
  )
}
