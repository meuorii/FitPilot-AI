import { useState } from 'react'
import type { FormEvent } from 'react'
import type { LoginRequest } from '../../services/types/auth'

const ICONS = {
  mail: 'https://www.figma.com/api/mcp/asset/49cce67a-4717-4dd0-9b88-21f2862d4212.png',
  password: 'https://www.figma.com/api/mcp/asset/2b7efcea-e592-4b44-94e0-1da2fe2d4c6c.png',
  showPassword: 'https://www.figma.com/api/mcp/asset/42eec4cb-a060-4afa-8869-5e4f4fe2e426.png',
  hidePassword: 'https://www.figma.com/api/mcp/asset/5085f228-0036-4da5-8319-c0747cf1e14d.png',
}

export interface LoginCredentials extends LoginRequest {
  rememberMe: boolean
}

interface LoginFormProps {
  onSubmit?: (credentials: LoginCredentials) => void | Promise<void>
  onForgotPassword?: () => void
  onSignUp?: () => void
  isLoading?: boolean
  errorMessage?: string | null
  successMessage?: string | null
}

export default function LoginForm({
  onSubmit,
  onForgotPassword,
  onSignUp,
  isLoading = false,
  errorMessage,
  successMessage,
}: LoginFormProps) {
  const [formData, setFormData] = useState<LoginCredentials>({ email: '', password: '', rememberMe: true })
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await onSubmit?.(formData)
  }

  return (
    <section className="w-full max-w-[435px] lg:-translate-y-[1.5vh]" aria-labelledby="login-title">
      <header className="mb-[clamp(52px,6.5vh,72px)] text-center">
        <h1 id="login-title" className="whitespace-nowrap text-[clamp(28px,2.64vw,38px)] font-bold leading-[1.14] tracking-[-0.035em] text-[#38323F]">Keep Pushing Forward</h1>
        <p className="mt-2.5 text-[clamp(14px,1.12vw,16px)] italic leading-6 text-[#7482A4]">Your goals are waiting. Let&apos;s keep going.</p>
      </header>

      <form onSubmit={handleSubmit} className="w-full">
        <label className="group block" htmlFor="email">
          <span className="flex items-center gap-2 text-[17px] leading-none text-[#38323F]">
            <img className="size-[23px] shrink-0 object-contain opacity-95 transition-transform duration-300 group-focus-within:-translate-y-0.5" src={ICONS.mail} alt="" aria-hidden="true" /> Email
          </span>
          <input id="email" name="email" type="email" autoComplete="email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} placeholder="example@gmail.com" required className="mt-[14px] h-10 w-full border-b border-[#38323F]/75 bg-transparent pb-[9px] text-[15px] text-[#38323F] outline-none transition-colors placeholder:text-black/25 focus:border-[#7482A4]" />
        </label>

        <label className="group mt-[clamp(32px,4.5vh,36px)] block" htmlFor="password">
          <span className="flex items-center gap-2 text-[17px] leading-none text-[#38323F]">
            <img className="size-[26px] shrink-0 object-contain opacity-95 transition-transform duration-300 group-focus-within:-translate-y-0.5" src={ICONS.password} alt="" aria-hidden="true" /> Password
          </span>
          <span className="relative mt-[14px] block">
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={formData.password} onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))} placeholder="••••••••••••••" required className="h-10 w-full border-b border-[#38323F]/75 bg-transparent pb-[9px] pr-9 text-[15px] tracking-[0.12em] text-[#38323F] outline-none transition-colors placeholder:tracking-normal placeholder:text-black/25 focus:border-[#7482A4]" />
            <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-[-2px] top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full transition hover:bg-[#7482A4]/10 active:scale-95" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>
              <img className={`size-4 object-contain ${showPassword ? 'opacity-100' : 'opacity-80'}`} src={showPassword ? ICONS.hidePassword : ICONS.showPassword} alt="" aria-hidden="true" />
            </button>
          </span>
        </label>

        <div className="mt-[14px] flex items-center justify-between gap-4">
          <label className="group/check flex cursor-pointer items-center gap-2 text-[13px] text-[#38323F]">
            <input id="remember-me" name="rememberMe" type="checkbox" checked={formData.rememberMe} onChange={(e) => setFormData((prev) => ({ ...prev, rememberMe: e.target.checked }))} className="peer sr-only" />
            <span className="grid size-[18px] shrink-0 place-items-center rounded-[3px] border border-[#7482A4] text-[#F5F3F6] transition-all peer-checked:bg-[#7482A4]">
              <svg viewBox="0 0 16 16" className={`size-[13px] transition-all ${formData.rememberMe ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`} fill="none" aria-hidden="true">
                <path d="M3.2 8.2 6.4 11.2 12.8 4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="transition-colors group-hover/check:text-[#7482A4]">Keep me logged in</span>
          </label>

          <button type="button" onClick={onForgotPassword} className="shrink-0 text-[11px] font-bold text-[#7482A4] underline decoration-[#7482A4]/70 hover:text-[#38323F]">Forgot Password?</button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-[clamp(40px,8.5vh,86px)] h-[50px] w-full rounded-[10px] bg-[#7482A4] text-[17px] font-bold text-[#F5F3F6] shadow-[0_4px_6.6px_rgba(116,130,164,0.26)] transition-all hover:-translate-y-0.5 hover:bg-[#697897] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        {(errorMessage || successMessage) && (
          <p
            role={errorMessage ? 'alert' : 'status'}
            aria-live="polite"
            className={`mt-3 rounded-lg px-3 py-2 text-center text-sm ${
              errorMessage ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {errorMessage ?? successMessage}
          </p>
        )}

        <p className="mt-[25px] text-center text-sm text-[#38323F]">
          Don&apos;t have an account?{' '}
          <button type="button" onClick={onSignUp} className="font-bold text-[#7482A4] hover:text-[#38323F]">Sign up</button>
        </p>
      </form>
    </section>
  )
}