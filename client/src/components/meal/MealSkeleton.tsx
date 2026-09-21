function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-[22px] bg-[#E9E6EB] ${className}`} />
}

export function MealSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading meals">
      <div className="flex items-center justify-between gap-5">
        <div className="space-y-2">
          <Block className="h-8 w-64" />
          <Block className="h-4 w-52" />
        </div>
        <Block className="hidden h-11 w-80 sm:block" />
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,2fr)_minmax(290px,1fr)]">
        <Block className="h-56 w-full" />
        <Block className="h-56 w-full" />
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,2fr)_minmax(290px,1fr)]">
        <div className="space-y-5">
          <Block className="h-[390px] w-full" />
          <Block className="h-48 w-full" />
          <Block className="h-72 w-full" />
        </div>
        <div className="space-y-5">
          <Block className="h-72 w-full" />
          <Block className="h-72 w-full" />
        </div>
      </div>
    </div>
  )
}
