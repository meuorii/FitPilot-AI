import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Bell, Menu, Search } from 'lucide-react'

export interface PageHeaderProps {
  title: string
  subtitle: string
  fullName?: string | null
  avatarUrl?: string | null
  onOpenSidebar: () => void
  search?: string
  onSearchChange?: (value: string) => void
  onSearchSubmit?: () => void
  searchPlaceholder?: string
  searchDisabled?: boolean
}

export const getFirstName = (fullName?: string | null) =>
  fullName?.trim().split(/\s+/)[0] || 'there'

const getInitials = (fullName?: string | null) => {
  if (!fullName?.trim()) return 'FP'
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function PageHeader({
  title,
  subtitle,
  fullName,
  avatarUrl,
  onOpenSidebar,
  search,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = 'Search...',
  searchDisabled = false,
}: PageHeaderProps) {
  const [avatarFailed, setAvatarFailed] = useState(false)

  useEffect(() => {
    setAvatarFailed(false)
  }, [avatarUrl])

  const showAvatar = Boolean(avatarUrl) && !avatarFailed
  const showSearch = onSearchChange !== undefined

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearchSubmit?.()
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
            {title}
          </h1>
          <p className="mt-1 text-sm text-[#77727B] sm:text-[15px]">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex w-full items-center gap-2 sm:gap-3 xl:w-auto">
        {showSearch ? (
          <form
            onSubmit={handleSubmit}
            className="relative min-w-0 flex-1 xl:w-[360px] xl:flex-none"
          >
            <label className="block">
              <span className="sr-only">{searchPlaceholder}</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7482A4]" />
              <input
                type="search"
                value={search ?? ''}
                disabled={searchDisabled}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  onSearchChange?.(event.target.value)
                }
                placeholder={searchPlaceholder}
                className="h-11 w-full rounded-2xl border border-[#7482A4]/15 bg-white pl-10 pr-4 text-sm text-[#38323F] outline-none transition placeholder:text-[#9C98A1] focus:border-[#7482A4] focus:ring-2 focus:ring-[#7482A4]/15 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>
          </form>
        ) : null}

        <button
          type="button"
          aria-label="Notifications"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#7482A4]/15 bg-white text-[#5F5A64] transition hover:bg-[#F5F3F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]"
        >
          <Bell className="h-5 w-5" />
        </button>

        {showAvatar ? (
          <img
            src={avatarUrl ?? ''}
            alt={`${fullName || 'FitPilot User'} profile`}
            onError={() => setAvatarFailed(true)}
            className="h-11 w-11 shrink-0 rounded-2xl border border-[#7482A4]/15 object-cover"
          />
        ) : (
          <div
            aria-label={`${fullName || 'FitPilot User'} profile`}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#7482A4] text-xs font-extrabold text-white"
          >
            {getInitials(fullName)}
          </div>
        )}
      </div>
    </header>
  )
}