import { type ChangeEvent, type FormEvent } from 'react'
import { Search } from 'lucide-react'

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

export function PageHeader({
  title,
  subtitle,
  fullName: _fullName,
  avatarUrl: _avatarUrl,
  onOpenSidebar: _onOpenSidebar,
  search,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = 'Search...',
  searchDisabled = false,
}: PageHeaderProps) {
  const showSearch = onSearchChange !== undefined

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearchSubmit?.()
  }

  return (
    <header className="dashboard-page-header">
      <div className="min-w-0">
          <h1 className="dashboard-page-title">
            {title}
          </h1>
          <p className="dashboard-page-subtitle">
            {subtitle}
          </p>
      </div>

      <div className="dashboard-page-tools">
        {showSearch ? (
          <form
            onSubmit={handleSubmit}
            className="dashboard-page-search"
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
                className="dashboard-input h-11 w-full pl-10 pr-4 text-sm text-[#38323F] outline-none placeholder:text-[#9C98A1] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>
          </form>
        ) : null}

      </div>
    </header>
  )
}
