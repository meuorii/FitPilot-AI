function SkeletonBlock({
  className,
}: {
  className: string
}) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-[#E8E5EA] ${className}`}
    />
  )
}

export function ProgressSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading Progress">
      <div className="grid gap-5 2xl:grid-cols-[minmax(0,2.15fr)_minmax(300px,0.85fr)]">
        <SkeletonBlock className="h-[390px] w-full rounded-[24px]" />
        <SkeletonBlock className="h-[390px] w-full rounded-[24px]" />
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,2.15fr)_minmax(300px,0.85fr)]">
        <div className="grid gap-5 xl:grid-cols-2">
          <SkeletonBlock className="h-[320px] w-full rounded-[24px]" />
          <SkeletonBlock className="h-[320px] w-full rounded-[24px]" />
          <SkeletonBlock className="h-[320px] w-full rounded-[24px]" />
          <SkeletonBlock className="h-[320px] w-full rounded-[24px]" />
          <SkeletonBlock className="h-[300px] w-full rounded-[24px] xl:col-span-2" />
        </div>

        <div className="space-y-5">
          <SkeletonBlock className="h-[330px] w-full rounded-[24px]" />
          <SkeletonBlock className="h-[330px] w-full rounded-[24px]" />
        </div>
      </div>
    </div>
  )
}
