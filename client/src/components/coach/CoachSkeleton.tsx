function SkeletonBlock({
  className,
}: {
  className: string
}) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-[#E9E6EB] ${className}`}
    />
  )
}

export function CoachHeroSkeleton() {
  return (
    <section className="min-h-[286px] rounded-[26px] border border-[#7482A4]/10 bg-white p-7">
      <SkeletonBlock className="h-9 w-64" />
      <SkeletonBlock className="mt-3 h-4 w-80 max-w-full" />
      <SkeletonBlock className="mt-2 h-4 w-60 max-w-full" />
      <div className="mt-7 grid grid-cols-3 gap-3">
        <SkeletonBlock className="h-12 w-full" />
        <SkeletonBlock className="h-12 w-full" />
        <SkeletonBlock className="h-12 w-full" />
      </div>
      <SkeletonBlock className="mt-7 h-11 w-36" />
    </section>
  )
}

export function CoachContextSkeleton() {
  return (
    <section className="min-h-[286px] rounded-[24px] border border-[#7482A4]/10 bg-white p-6">
      <SkeletonBlock className="h-6 w-52" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: 6 }).map(
          (_, index) => (
            <div
              key={index}
              className="flex items-center gap-3"
            >
              <SkeletonBlock className="h-9 w-9 shrink-0" />
              <SkeletonBlock className="h-4 flex-1" />
              <SkeletonBlock className="h-4 w-20" />
            </div>
          ),
        )}
      </div>
    </section>
  )
}

export function CoachSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading AI Coach">
      <div className="grid gap-5 2xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <CoachHeroSkeleton />
        <CoachContextSkeleton />
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <SkeletonBlock className="h-[650px] w-full rounded-[24px]" />
        <div className="space-y-5">
          <SkeletonBlock className="h-80 w-full rounded-[24px]" />
          <SkeletonBlock className="h-72 w-full rounded-[24px]" />
        </div>
      </div>
    </div>
  )
}
