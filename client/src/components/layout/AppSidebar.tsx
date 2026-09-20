import {
  Apple,
  BarChart3,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  MessageCircleMore,
  Settings,
  Sparkles,
  X,
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { NavLink, useNavigate } from 'react-router-dom'
import roccoDashboard from '../../assets/images/rocco-dashboard.png'

interface AppSidebarProps {
  mobileOpen: boolean
  onClose: () => void
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

function SidebarBody({ onClose }: Pick<AppSidebarProps, 'onClose'>) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleLogout = () => {
    // LoginPage can save auth data in either storage depending on Remember Me,
    // so remove both to guarantee the session is completely cleared.
    window.localStorage.removeItem(AUTH_TOKEN_KEY)
    window.localStorage.removeItem(AUTH_USER_KEY)
    window.sessionStorage.removeItem(AUTH_TOKEN_KEY)
    window.sessionStorage.removeItem(AUTH_USER_KEY)

    // Remove cached authenticated server data before returning to login.
    queryClient.clear()

    onClose()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-white px-4 py-5">
      <div className="mb-8 flex items-center justify-between px-2">
        <NavLink
          to="/dashboard"
          className="text-xl font-extrabold tracking-tight text-[#38323F]"
          onClick={onClose}
        >
          FitPilot<span className="text-[#7482A4]"> AI</span>
        </NavLink>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="rounded-xl p-2 text-[#6F6A74] hover:bg-[#F5F3F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav aria-label="Main navigation" className="space-y-1.5">
        {navigation.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2',
                isActive
                  ? 'bg-[#7482A4]/12 text-[#5F6E91]'
                  : 'text-[#77727B] hover:bg-[#F5F3F6] hover:text-[#38323F]',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={isActive ? 'h-5 w-5 text-[#7482A4]' : 'h-5 w-5'}
                  strokeWidth={1.9}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-8">
        <div className="overflow-hidden rounded-[22px] border border-[#EAE7EC] bg-[#F8F7F9] p-4">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-[#38323F]">
                Need help? Ask Rocco
              </p>
              <p className="mt-1 text-xs leading-5 text-[#77727B]">
                Your AI coach is here to help you train smarter and stay consistent.
              </p>
            </div>

            <img
              src={roccoDashboard}
              alt="Rocco, the FitPilot wolf mascot"
              className="h-20 w-20 shrink-0 object-contain"
            />
          </div>

          <NavLink
            to="/coach"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#38323F] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#4A4350] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2"
          >
            <MessageCircleMore className="h-4 w-4" />
            Chat with Rocco
          </NavLink>
        </div>

        <div className="my-4 h-px bg-[#EAE7EC]" />

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold text-[#77727B] transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.9} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export function AppSidebar({ mobileOpen, onClose }: AppSidebarProps) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[#EAE7EC] lg:block">
        <SidebarBody onClose={onClose} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={onClose}
            className="absolute inset-0 bg-[#211E24]/35 backdrop-blur-[2px]"
          />

          <aside className="relative h-full w-[86%] max-w-72 border-r border-[#EAE7EC] shadow-2xl">
            <SidebarBody onClose={onClose} />
          </aside>
        </div>
      )}
    </>
  )
}