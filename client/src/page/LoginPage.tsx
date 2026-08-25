import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm, { type LoginCredentials } from '../components/Auth/LoginForm'
import { loginUser } from '../services/api/auth'
import { useToastStore } from '../stores/toastStore'

const AUTH_TOKEN_KEY = 'fitpilot_token'
const AUTH_USER_KEY = 'fitpilot_user'
const LOGIN_ARTWORK = '/Auth/Login/image.png'

export default function LoginPage() {
  const navigate = useNavigate()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const showToast = useToastStore((state) => state.showToast)
  const hideToast = useToastStore((state) => state.hideToast)

  const handleLogin = async ({ email, password, rememberMe }: LoginCredentials) => {
    setIsLoggingIn(true)
    hideToast()
    try {
      const response = await loginUser({ email: email.trim(), password })
      const storage = rememberMe ? window.localStorage : window.sessionStorage
      const previousStorage = rememberMe ? window.sessionStorage : window.localStorage
      previousStorage.removeItem(AUTH_TOKEN_KEY)
      previousStorage.removeItem(AUTH_USER_KEY)
      storage.setItem(AUTH_TOKEN_KEY, response.data.token)
      storage.setItem(AUTH_USER_KEY, JSON.stringify(response.data.user))
      showToast({
        type: 'success',
        heading: 'Welcome back!',
        subheading: response.message || "You're signed in and ready to continue your fitness journey.",
      })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      showToast({
        type: 'error',
        heading: 'Login failed',
        subheading: error instanceof Error ? error.message : 'The email or password you entered is incorrect.',
      })
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes login-rise-in { from { opacity: 0; translate: 0 18px; } to { opacity: 1; translate: 0 0; } }
        @keyframes login-artwork-enter { from { opacity: 0; translate: 0 22px; scale: 0.985; } to { opacity: 1; translate: 0 0; scale: 1; } }
        @keyframes login-artwork-settle { from { scale: 1.035; } to { scale: 1; } }
        @keyframes login-icon-pop { from { opacity: 0; scale: 0.72; } to { opacity: 1; scale: 1; } }
        .login-artwork-panel { animation: login-artwork-enter 760ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .login-artwork-image { animation: login-artwork-settle 1100ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .login-form-shell { animation: login-rise-in 650ms cubic-bezier(0.22, 1, 0.36, 1) 100ms both; }
        .login-stagger-item { animation: login-rise-in 560ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .login-stagger-1 { animation-delay: 180ms; }
        .login-stagger-2 { animation-delay: 250ms; }
        .login-stagger-3 { animation-delay: 320ms; }
        .login-stagger-4 { animation-delay: 390ms; }
        .login-stagger-5 { animation-delay: 460ms; }
        .login-stagger-6 { animation-delay: 530ms; }
        .login-password-icon { animation: login-icon-pop 180ms ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .login-artwork-panel, .login-artwork-image, .login-form-shell, .login-stagger-item, .login-password-icon { animation: none; }
        }
      `}</style>
      <main className="min-h-dvh w-full overflow-x-hidden bg-[#F5F3F6] px-5 py-5 font-['Inter',ui-sans-serif,system-ui,sans-serif] sm:px-6 sm:py-6 lg:h-dvh lg:overflow-hidden lg:px-[clamp(24px,4vw,58px)] lg:py-[clamp(20px,4vh,44px)]">
        <div className="mx-auto flex w-full max-w-[1332px] flex-col items-center gap-10 lg:h-full lg:min-h-0 lg:flex-row lg:gap-[clamp(28px,2.9vw,42px)]">
          <figure className="login-artwork-panel m-0 h-[clamp(260px,42dvh,420px)] w-full max-w-[560px] shrink-0 overflow-hidden rounded-[32px] bg-[#ECEAF1] shadow-[0_0_80px_10px_rgba(56,50,63,0.15)] lg:aspect-[754/943] lg:h-auto lg:max-h-[943px] lg:max-w-[754px] lg:w-[min(calc((100dvh_-_clamp(40px,_8vh,_88px))_*_0.799575),_calc(100%_-_clamp(350px,_35vw,_535px)_-_clamp(28px,_2.9vw,_42px)))] lg:rounded-[clamp(44px,4.2vw,60px)]">
            <img src={LOGIN_ARTWORK} alt="Rocco, the FitPilot wolf mascot, surrounded by healthy food and workout equipment" draggable={false} className="login-artwork-image h-full w-full select-none object-cover object-center" />
          </figure>
          <section className="login-form-shell flex w-full flex-1 items-center justify-center lg:h-full lg:min-h-0 lg:min-w-[350px]">
            <LoginForm onSubmit={handleLogin} onSignUp={() => navigate('/register')} isLoading={isLoggingIn} />
          </section>
        </div>
      </main>
    </>
  )
}