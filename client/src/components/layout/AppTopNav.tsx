import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Apple,
  BarChart3,
  Bell,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  X,
} from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

import { LogoutConfirmModal } from '../modals/LogoutConfirmModal'

interface AppTopNavProps {
  mobileOpen: boolean
  onMobileToggle: () => void
  onMobileClose: () => void
}

const AUTH_TOKEN_KEY = 'fitpilot_token'
const AUTH_USER_KEY = 'fitpilot_user'

const navigation = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Workouts', to: '/workouts', icon: Dumbbell },
  { label: 'Meals', to: '/meals', icon: Apple },
  { label: 'AI Coach', to: '/coach', icon: Sparkles },
  { label: 'Progress', to: '/progress', icon: BarChart3 },
  { label: 'Settings', to: '/settings', icon: Settings },
]

type StoredUser = {
  full_name?: string | null
  name?: string | null
  avatar_url?: string | null
  avatarUrl?: string | null
}

function readStoredUser(): StoredUser | null {
  try {
    const raw = window.localStorage.getItem(AUTH_USER_KEY)
    return raw ? (JSON.parse(raw) as StoredUser) : null
  } catch {
    return null
  }
}

function initials(user: StoredUser | null) {
  const name = user?.full_name || user?.name || ''
  return name
    ? name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
    : 'FP'
}

function userName(user: StoredUser | null) {
  return user?.full_name || user?.name || 'FitPilot User'
}

export function AppTopNav({ mobileOpen, onMobileToggle, onMobileClose }: AppTopNavProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const [user, setUser] = useState<StoredUser | null>(() => readStoredUser())
  const accountRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const mobileWasOpen = useRef(false)

  useEffect(() => {
    const onStorage = () => setUser(readStoredUser())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    if (!accountMenuOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountMenuOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [accountMenuOpen])

  useEffect(() => {
    if (!mobileOpen) {
      if (mobileWasOpen.current) menuButtonRef.current?.focus({ preventScroll: true })
      mobileWasOpen.current = false
      return
    }
    mobileWasOpen.current = true
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onMobileClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen, onMobileClose])

  const requestLogout = () => {
    setAccountMenuOpen(false)
    onMobileClose()
    setLogoutModalOpen(true)
  }

  const confirmLogout = () => {
    window.localStorage.removeItem(AUTH_TOKEN_KEY)
    window.localStorage.removeItem(AUTH_USER_KEY)
    window.sessionStorage.removeItem(AUTH_TOKEN_KEY)
    window.sessionStorage.removeItem(AUTH_USER_KEY)
    queryClient.clear()
    setLogoutModalOpen(false)
    navigate('/login', { replace: true })
  }

  const avatarUrl = user?.avatar_url || user?.avatarUrl
  const currentPage = navigation.find(({ to }) => location.pathname.startsWith(to))?.label || 'Dashboard'

  return (
    <>
      <header className="dashboard-top-nav">
        <div className="dashboard-top-nav__inner">
          <NavLink to="/dashboard" className="dashboard-brand" onClick={onMobileClose}>
            FitPilot<span> AI</span>
          </NavLink>
          <span className="dashboard-mobile-current-page" aria-hidden="true">{currentPage}</span>

          <nav aria-label="Main navigation" className="dashboard-top-nav__links">
            {navigation.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `dashboard-nav-link${isActive ? ' is-active' : ''}`}
              >
                <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.9} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="dashboard-top-nav__actions">
            <button type="button" aria-label="Notifications" className="dashboard-icon-button">
              <Bell aria-hidden="true" className="h-[18px] w-[18px]" />
            </button>

            <div ref={accountRef} className="relative">
              <button
                type="button"
                aria-label="Open account menu"
                aria-haspopup="menu"
                aria-expanded={accountMenuOpen}
                aria-controls="dashboard-account-menu"
                onClick={() => setAccountMenuOpen((open) => !open)}
                className="dashboard-account-button"
              >
                {avatarUrl && !avatarFailed ? (
                  <img src={avatarUrl} alt="" onError={() => setAvatarFailed(true)} />
                ) : (
                  <span>{initials(user)}</span>
                )}
              </button>

              {accountMenuOpen ? (
                <div id="dashboard-account-menu" className="dashboard-account-menu" role="menu">
                  <p className="dashboard-account-menu__name">{userName(user)}</p>
                  <button type="button" role="menuitem" onClick={requestLogout} className="dashboard-menu-action">
                    <LogOut aria-hidden="true" className="h-4 w-4" /> Logout
                  </button>
                </div>
              ) : null}
            </div>

            <button
              ref={menuButtonRef}
              type="button"
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileOpen}
              aria-controls="dashboard-mobile-sheet"
              onClick={onMobileToggle}
              className="dashboard-mobile-menu-button"
            >
              {mobileOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div id="dashboard-mobile-sheet" className="dashboard-mobile-sheet" role="dialog" aria-label="Navigation menu">
            <nav aria-label="Mobile navigation" className="dashboard-mobile-sheet__links">
              {navigation.map(({ label, to, icon: Icon }) => (
                <NavLink key={to} to={to} onClick={onMobileClose} className={({ isActive }) => `dashboard-mobile-link${isActive ? ' is-active' : ''}`}>
                  <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
                  {label}
                </NavLink>
              ))}
              <button type="button" onClick={requestLogout} className="dashboard-mobile-link dashboard-mobile-link--logout">
                <LogOut aria-hidden="true" className="h-5 w-5" /> Logout
              </button>
            </nav>
          </div>
        ) : null}
      </header>

      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </>
  )
}
