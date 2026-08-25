import { useState, type ChangeEvent, type FormEvent } from 'react'
import type { LoginRequest } from '../../services/types/auth'

const ICONS = {
  email: '/Auth/Login/email.png',
  password: '/Auth/Login/password.png',
  viewPassword: '/Auth/Login/view.png',
  hidePassword: '/Auth/Login/close.png',
} as const

export interface LoginCredentials extends LoginRequest {
  rememberMe: boolean
}

interface LoginFormProps {
  onSubmit?: (credentials: LoginCredentials) => void | Promise<void>
  onForgotPassword?: () => void
  onSignUp?: () => void
  isLoading?: boolean
}

export default function LoginForm({ onSubmit, onForgotPassword, onSignUp, isLoading = false }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginCredentials>({ email: '', password: '', rememberMe: true })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await onSubmit?.(formData)
  }

  return (
    <section className="w-full max-w-108.75 lg:-translate-y-[clamp(0px,1.5vh,15px)]" aria-labelledby="login-title">
      <header className="login-stagger-item login-stagger-1 mb-[clamp(52px,6.5vh,72px)] text-center">
        <h1 id="login-title" className="whitespace-nowrap text-[clamp(28px,2.64vw,38px)] font-bold leading-[1.14] tracking-[-0.035em] text-[#38323F]">Keep Pushing Forward</h1>
        <p className="mt-2.5 text-[clamp(14px,1.12vw,16px)] italic leading-6 text-[#7482A4]">Your goals are waiting. Let&apos;s keep going.</p>
      </header>
      <form onSubmit={handleSubmit} className="w-full">
        <label className="login-stagger-item login-stagger-2 group block" htmlFor="email">
          <span className="flex items-center gap-2 text-[17px] font-normal leading-none text-[#38323F]">
            <img className="size-5.75 shrink-0 select-none object-contain transition-transform duration-300 group-focus-within:-translate-y-0.5" src={ICONS.email} alt="" aria-hidden="true" draggable={false} />
            Email
          </span>
          <input id="email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} placeholder="example@gmail.com" required className="mt-3.5 h-10 w-full rounded-none border-0 border-b border-[#38323F]/80 bg-transparent px-0 pb-2.25 text-[15px] leading-5 text-[#38323F] outline-none transition-colors duration-200 placeholder:text-[#38323F]/25 focus:border-[#7482A4] focus:ring-0" />
        </label>
        <label className="login-stagger-item login-stagger-3 group mt-[clamp(32px,4.5vh,36px)] block" htmlFor="password">
          <span className="flex items-center gap-2 text-[17px] font-normal leading-none text-[#38323F]">
            <img className="size-6.5 shrink-0 select-none object-contain transition-transform duration-300 group-focus-within:-translate-y-0.5" src={ICONS.password} alt="" aria-hidden="true" draggable={false} />
            Password
          </span>
          <span className="relative mt-3.5 block">
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={formData.password} onChange={handleChange} placeholder="••••••••••••••" required className={`h-10 w-full rounded-none border-0 border-b border-[#38323F]/80 bg-transparent px-0 pb-2.25 pr-10 text-[15px] leading-5 text-[#38323F] outline-none transition-colors duration-200 placeholder:text-[#38323F]/25 focus:border-[#7482A4] focus:ring-0 ${!showPassword ? 'tracking-[0.12em] placeholder:tracking-normal' : ''}`} />
            <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute -right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full transition-colors hover:bg-[#7482A4]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]/35 active:scale-95" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>
              <img key={showPassword ? 'hide' : 'show'} className="login-password-icon size-4.25 select-none object-contain" src={showPassword ? ICONS.hidePassword : ICONS.viewPassword} alt="" aria-hidden="true" draggable={false} />
            </button>
          </span>
        </label>
        <div className="login-stagger-item login-stagger-4 mt-3.5 flex items-center justify-between gap-4">
          <label htmlFor="remember-me" className="group/check flex cursor-pointer items-center gap-2 text-[13px] text-[#38323F]">
            <input id="remember-me" name="rememberMe" type="checkbox" checked={formData.rememberMe} onChange={handleChange} className="peer sr-only" />
            <span className="grid size-4.5 shrink-0 place-items-center rounded-[3px] border border-[#7482A4] text-[#F5F3F6] transition-all peer-checked:bg-[#7482A4] peer-focus-visible:ring-2 peer-focus-visible:ring-[#7482A4]/35 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#F5F3F6]">
              <svg viewBox="0 0 16 16" className={`size-3.25 transition-all ${formData.rememberMe ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`} fill="none" aria-hidden="true">
                <path d="M3.2 8.2 6.4 11.2 12.8 4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="transition-colors group-hover/check:text-[#7482A4]">Keep me logged in</span>
          </label>
          <button type="button" onClick={onForgotPassword} className="shrink-0 text-[11px] font-bold text-[#7482A4] underline decoration-[#7482A4]/70 underline-offset-2 transition-colors hover:text-[#38323F] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]/35">Forgot Password?</button>
        </div>
        <button type="submit" disabled={isLoading} className="login-stagger-item login-stagger-5 mt-[clamp(48px,9vh,92px)] flex h-12.5 w-full items-center justify-center gap-2.5 rounded-[10px] bg-[#7482A4] text-[17px] font-bold text-[#F8F8FF] shadow-[0_4px_7px_rgba(116,130,164,0.26)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#697897] hover:shadow-[0_7px_14px_rgba(116,130,164,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F3F6] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0">
          {isLoading && <span aria-hidden="true" className="size-4 rounded-full border-2 border-white/40 border-t-white motion-safe:animate-spin" />}
          <span>{isLoading ? 'Logging in...' : 'Login'}</span>
        </button>
        <p className="login-stagger-item login-stagger-6 mt-6.25 text-center text-[14px] text-[#38323F]">
          Don&apos;t have an account?{' '}
          <button type="button" onClick={onSignUp} className="font-bold text-[#7482A4] transition-colors hover:text-[#38323F] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]/35">Sign up</button>
        </p>
      </form>
    </section>
  )
}