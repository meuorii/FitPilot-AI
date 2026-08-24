import { useState } from 'react'
import type { FormEvent } from 'react'

const ICONS = {
  fullName: '/Auth/Register/user.png',
  email: '/Auth/Register/email.png',
  password: '/Auth/Register/password.png',
  confirmPassword: '/Auth/Register/approve.png',
  viewPassword: '/Auth/Register/view.png',
  hidePassword: '/Auth/Register/close.png',
}

export interface RegisterCredentials {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

interface RegisterFormProps {
  onSubmit?: (credentials: RegisterCredentials) => void | Promise<void>
  onLogin?: () => void
  isLoading?: boolean
}

interface FieldLabelProps {
  icon: string
  children: string
  iconClassName?: string
}

function FieldLabel({ icon, children, iconClassName = 'size-[19px]' }: FieldLabelProps) {
  return (
    <span className="flex items-center gap-2 text-[17px] font-normal leading-none text-[#38323F]">
      <img
        src={icon}
        alt=""
        aria-hidden="true"
        draggable={false}
        className={`shrink-0 select-none object-contain ${iconClassName}`}
      />
      {children}
    </span>
  )
}

interface PasswordToggleProps {
  visible: boolean
  onToggle: () => void
  label: string
}

function PasswordToggle({ visible, onToggle, label }: PasswordToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute -right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full transition-colors hover:bg-[#7482A4]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]/35 active:scale-95"
      aria-label={`${visible ? 'Hide' : 'Show'} ${label}`}
      aria-pressed={visible}
    >
      <img
        src={visible ? ICONS.hidePassword : ICONS.viewPassword}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="size-4 select-none object-contain"
      />
    </button>
  )
}

export default function RegisterForm({ onSubmit, onLogin, isLoading = false }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterCredentials>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const confirmPasswordInput = event.currentTarget.elements.namedItem('confirmPassword') as HTMLInputElement | null

    if (formData.password !== formData.confirmPassword) {
      confirmPasswordInput?.setCustomValidity('Passwords do not match.')
      confirmPasswordInput?.reportValidity()
      return
    }

    confirmPasswordInput?.setCustomValidity('')
    await onSubmit?.(formData)
  }

  return (
    <section className="w-full max-w-[435px]" aria-labelledby="register-title">
      <header className="mb-[clamp(40px,5.5vh,56px)] text-center">
        <h1
          id="register-title"
          className="whitespace-nowrap text-[clamp(27px,2.64vw,38px)] font-bold leading-[1.14] tracking-[-0.035em] text-[#38323F]"
        >
          Start Your Fitness Journey
        </h1>
        <p className="mt-2.5 whitespace-nowrap text-[clamp(12px,1.12vw,16px)] italic leading-6 text-[#7482A4]">
          Create your account and let Rocco help you reach your goals.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="space-y-[clamp(28px,4.1vh,42px)]">
          <label className="group block" htmlFor="full-name">
            <FieldLabel icon={ICONS.fullName}>Full Name</FieldLabel>
            <input
              id="full-name"
              name="fullName"
              type="text"
              autoComplete="name"
              value={formData.fullName}
              onChange={(event) => setFormData((previous) => ({ ...previous, fullName: event.target.value }))}
              placeholder="John Doe"
              required
              className="mt-2 h-[31px] w-full rounded-none border-0 border-b border-[#38323F]/80 bg-transparent px-0 pb-[7px] text-[15px] leading-5 text-[#38323F] outline-none transition-colors duration-200 placeholder:text-[#38323F]/25 focus:border-[#7482A4] focus:ring-0"
            />
          </label>

          <label className="group block" htmlFor="register-email">
            <FieldLabel icon={ICONS.email} iconClassName="size-[18px]">Email</FieldLabel>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(event) => setFormData((previous) => ({ ...previous, email: event.target.value }))}
              placeholder="example@gmail.com"
              required
              className="mt-[13px] h-[31px] w-full rounded-none border-0 border-b border-[#38323F]/80 bg-transparent px-0 pb-[7px] text-[15px] leading-5 text-[#38323F] outline-none transition-colors duration-200 placeholder:text-[#38323F]/25 focus:border-[#7482A4] focus:ring-0"
            />
          </label>

          <div className="group block">
            <label htmlFor="register-password">
              <FieldLabel icon={ICONS.password} iconClassName="size-[18px]">Password</FieldLabel>
            </label>
            <span className="relative mt-2 block">
              <input
                id="register-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.password}
                onChange={(event) => setFormData((previous) => ({ ...previous, password: event.target.value }))}
                placeholder="••••••••••••••"
                required
                minLength={8}
                className="h-[31px] w-full rounded-none border-0 border-b border-[#38323F]/80 bg-transparent px-0 pb-[7px] pr-10 text-[15px] leading-5 tracking-[0.12em] text-[#38323F] outline-none transition-colors duration-200 placeholder:tracking-normal placeholder:text-[#38323F]/25 focus:border-[#7482A4] focus:ring-0"
              />
              <PasswordToggle
                visible={showPassword}
                onToggle={() => setShowPassword((previous) => !previous)}
                label="password"
              />
            </span>
          </div>

          <div className="group block">
            <label htmlFor="confirm-password">
              <FieldLabel icon={ICONS.confirmPassword} iconClassName="size-[18px]">Confirm Password</FieldLabel>
            </label>
            <span className="relative mt-2 block">
              <input
                id="confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={(event) => {
                  event.currentTarget.setCustomValidity('')
                  setFormData((previous) => ({ ...previous, confirmPassword: event.target.value }))
                }}
                placeholder="••••••••••••••"
                required
                minLength={8}
                className="h-[31px] w-full rounded-none border-0 border-b border-[#38323F]/80 bg-transparent px-0 pb-[7px] pr-10 text-[15px] leading-5 tracking-[0.12em] text-[#38323F] outline-none transition-colors duration-200 placeholder:tracking-normal placeholder:text-[#38323F]/25 focus:border-[#7482A4] focus:ring-0"
              />
              <PasswordToggle
                visible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((previous) => !previous)}
                label="confirmation password"
              />
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-[clamp(40px,6.25vh,64px)] h-[50px] w-full rounded-[10px] bg-[#7482A4] text-[17px] font-bold text-[#F8F8FF] shadow-[0_4px_7px_rgba(116,130,164,0.26)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#697897] hover:shadow-[0_7px_14px_rgba(116,130,164,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F3F6] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>

        <p className="mt-[25px] text-center text-[14px] text-[#38323F]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onLogin}
            className="font-bold text-[#7482A4] transition-colors hover:text-[#38323F] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]/35"
          >
            Log in
          </button>
        </p>
      </form>
    </section>
  )
}