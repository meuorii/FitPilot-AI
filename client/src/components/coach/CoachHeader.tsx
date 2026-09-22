import type {
  ChangeEvent,
  FormEvent,
} from 'react'
import {
  Bell,
  Menu,
  Search,
} from 'lucide-react'

interface CoachHeaderProps {
  fullName: string
  avatarUrl?: string | null
  searchValue: string
  isSending: boolean
  onSearchChange: (value: string) => void
  onSearchSubmit: () => void
  onOpenSidebar: () => void
}

const getFirstName = (fullName: string) =>
  fullName.trim().split(/\s+/)[0] || 'Athlete'

const getInitials = (fullName: string) => {
  const initials = fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return initials || 'FP'
}

export function CoachHeader({
  fullName,
  avatarUrl,
  searchValue,
  isSending,
  onSearchChange,
  onSearchSubmit,
  onOpenSidebar,
}: CoachHeaderProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearchSubmit()
  }

  return (
    <header className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
          className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#7482A4]/15 bg-white text-[#38323F] shadow-sm transition hover:bg-[#F5F3F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold tracking-[-0.035em] text-[#38323F] sm:text-[34px]">
            Talk with Rocco, {getFirstName(fullName)} 👋
          </h1>
          <p className="mt-1 text-sm text-[#77727B] sm:text-[15px]">
            Your AI fitness coach for workouts, meals, and daily guidance.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center gap-2 sm:gap-3 xl:w-auto">
        <form
          onSubmit={handleSubmit}
          className="relative min-w-0 flex-1 xl:w-[360px] xl:flex-none"
        >
          <label className="block">
            <span className="sr-only">
              Ask Rocco from the header
            </span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7482A4]" />
            <input
              type="text"
              value={searchValue}
              disabled={isSending}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onSearchChange(event.target.value)
              }
              placeholder="Search workouts, meals, or ask Rocco..."
              className="h-11 w-full rounded-2xl border border-[#7482A4]/15 bg-white pl-10 pr-4 text-sm text-[#38323F] outline-none transition placeholder:text-[#9C98A1] focus:border-[#7482A4] focus:ring-2 focus:ring-[#7482A4]/15 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
        </form>

        <button
          type="button"
          aria-label="Notifications"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#7482A4]/15 bg-white text-[#5F5A64] transition hover:bg-[#F5F3F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
        >
          <Bell className="h-5 w-5" />
        </button>

        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${fullName} profile`}
            className="h-11 w-11 shrink-0 rounded-2xl border border-[#7482A4]/15 object-cover"
          />
        ) : (
          <div
            aria-label={`${fullName} profile`}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#7482A4] text-xs font-extrabold text-white"
          >
            {getInitials(fullName)}
          </div>
        )}
      </div>
    </header>
  )
}
