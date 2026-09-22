function SkeletonBlock({
  className,
}: {
  className: string
}) {
  return (
    <div
      className={`animate-pulse rounded-[24px] bg-[#E8E5EA] ${className}`}
    />
  )
}

export function SettingsSkeleton() {
  return (
    <div
      className="space-y-5"
      aria-label="Loading settings"
    >
      <div className="grid gap-5 2xl:grid-cols-[minmax(0,2.15fr)_minmax(300px,0.85fr)]">
        <SkeletonBlock className="h-[390px] w-full" />
        <SkeletonBlock className="h-[390px] w-full" />
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,2.15fr)_minmax(300px,0.85fr)]">
        <div className="grid gap-5 xl:grid-cols-2">
          <SkeletonBlock className="h-[420px] w-full" />
          <SkeletonBlock className="h-[420px] w-full" />
          <SkeletonBlock className="h-[520px] w-full" />
          <SkeletonBlock className="h-[470px] w-full" />
          <SkeletonBlock className="h-[330px] w-full xl:col-span-2" />
        </div>

        <div className="space-y-5">
          <SkeletonBlock className="h-[420px] w-full" />
          <SkeletonBlock className="h-[360px] w-full" />
        </div>
      </div>
    </div>
  )
}
