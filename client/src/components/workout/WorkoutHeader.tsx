import { Bell, Menu, Search } from 'lucide-react'

interface StoredUser {
  full_name?: string
  name?: string
  email?: string
  avatar_url?: string | null
}

interface WorkoutHeaderProps {
  search: string
  onSearchChange: (value: string) => void
  onOpenSidebar: () => void
}

const readStoredUser = (): StoredUser => {
  const raw =
    window.localStorage.getItem('fitpilot_user') ??
    window.sessionStorage.getItem('fitpilot_user')

  if (!raw) return {}

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}

    const user = parsed as Record<string, unknown>
    const avatarUrl = user.avatar_url

    return {
      full_name:
        typeof user.full_name === 'string' ? user.full_name : undefined,
      name: typeof user.name === 'string' ? user.name : undefined,
      email: typeof user.email === 'string' ? user.email : undefined,
      avatar_url:
        typeof avatarUrl === 'string'
          ? avatarUrl
          : avatarUrl === null
            ? null
            : undefined,
    }
  } catch {
    return {}
  }
}

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'FP'
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function WorkoutHeader({
  search,
  onSearchChange,
  onOpenSidebar,
}: WorkoutHeaderProps) {
  const user = readStoredUser()
  const displayName = user.full_name ?? user.name ?? user.email ?? 'FitPilot User'
  const initials = getInitials(displayName)

  return (
    <header className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
          className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#EAE7EC] bg-white text-[#38323F] shadow-sm transition hover:bg-[#F5F3F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold tracking-[-0.035em] text-[#38323F] sm:text-[34px]">
            Workout
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#77727B] sm:text-[15px]">
            Track your split, start today&apos;s session, and log every set with ease.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center gap-2 sm:gap-3 xl:w-auto">
        <label className="relative min-w-0 flex-1 xl:w-[360px] xl:flex-none">
          <span className="sr-only">Search workouts</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#7482A4]" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search workouts, exercises, or anything..."
            className="h-11 w-full rounded-2xl border border-[#E2DFE6] bg-white pl-10 pr-4 text-sm text-[#38323F] outline-none transition placeholder:text-[#AAA5AE] focus:border-[#7482A4] focus:ring-4 focus:ring-[#7482A4]/10"
          />
        </label>

        <button
          type="button"
          aria-label="Notifications"
          className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#EAE7EC] bg-white text-[#38323F] shadow-sm transition hover:bg-[#F8F7F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#7482A4] ring-2 ring-white" />
        </button>

        <div
          className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#7482A4] text-sm font-extrabold text-white shadow-sm"
          title={displayName}
          aria-label={`Signed in as ${displayName}`}
        >
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
      </div>
    </header>
  )
}
