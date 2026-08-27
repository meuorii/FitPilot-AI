import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { resendVerification, verifyEmail } from '../../services/api/auth'
import { useToastStore } from '../../stores/toastStore'

const LOCAL_MASCOT_ASSET = '/Auth/Email-Verification/mascot.png'
const LOCAL_CLOSE_ICON_ASSET = '/Auth/Email-Verification/cancel.png'
const CODE_LENGTH = 6
const AUTH_TOKEN_KEY = 'fitpilot_token'
const AUTH_USER_KEY = 'fitpilot_user'

export interface EmailVerificationModalProps { open: boolean; email: string; onClose: () => void; initialResendSeconds?: number; mascotSrc?: string; closeIconSrc?: string; }

const createEmptyCode = () => Array<string>(CODE_LENGTH).fill('')

export default function EmailVerificationModal({ open, email, onClose, initialResendSeconds = 45, mascotSrc = LOCAL_MASCOT_ASSET, closeIconSrc = LOCAL_CLOSE_ICON_ASSET }: EmailVerificationModalProps) {
  const navigate = useNavigate()
  const showToast = useToastStore((state) => state.showToast)
  const hideToast = useToastStore((state) => state.hideToast)
  const [code, setCode] = useState<string[]>(createEmptyCode)
  const [secondsRemaining, setSecondsRemaining] = useState(initialResendSeconds)
  const [localError, setLocalError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const isBusy = isVerifying || isResending

  useEffect(() => {
    if (!open) return
    setCode(createEmptyCode()); setLocalError(null); setSecondsRemaining(initialResendSeconds); setIsVerifying(false); setIsResending(false)
  }, [initialResendSeconds, open])

  useEffect(() => {
    if (!open) return
    const focusTimer = window.setTimeout(() => inputRefs.current[0]?.focus(), 80)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.clearTimeout(focusTimer); document.body.style.overflow = previousOverflow }
  }, [open])

  useEffect(() => {
    if (!open) return
    const interval = window.setInterval(() => { setSecondsRemaining((current) => Math.max(current - 1, 0)) }, 1000)
    return () => window.clearInterval(interval)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleEscape = (event: globalThis.KeyboardEvent) => { if (event.key === 'Escape' && !isBusy) onClose() }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isBusy, onClose, open])

  if (!open) return null

  const completeCode = code.join('')
  const canVerify = completeCode.length === CODE_LENGTH && !isBusy
  const canResend = secondsRemaining === 0 && !isBusy

  const distributeDigits = (value: string, startingIndex = 0) => {
    const digits = value.replace(/\D/g, '').slice(0, CODE_LENGTH - startingIndex)
    if (!digits) return
    setCode((current) => {
      const next = [...current]
      digits.split('').forEach((digit, offset) => { next[startingIndex + offset] = digit })
      return next
    })
    setLocalError(null)
    inputRefs.current[Math.min(startingIndex + digits.length, CODE_LENGTH - 1)]?.focus()
  }

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) { distributeDigits(value, index); return }
    const digit = value.replace(/\D/g, '')
    setCode((current) => { const next = [...current]; next[index] = digit; return next })
    setLocalError(null)
    if (digit && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus()
  }

  const handleInputKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !code[index] && index > 0) inputRefs.current[index - 1]?.focus()
    if (event.key === 'ArrowLeft' && index > 0) { event.preventDefault(); inputRefs.current[index - 1]?.focus() }
    if (event.key === 'ArrowRight' && index < CODE_LENGTH - 1) { event.preventDefault(); inputRefs.current[index + 1]?.focus() }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (completeCode.length !== CODE_LENGTH) {
      setLocalError('Enter the complete 6-digit verification code.')
      inputRefs.current[code.findIndex((digit) => !digit)]?.focus()
      return
    }
    setLocalError(null); setIsVerifying(true); hideToast()
    try {
      const response = await verifyEmail({ email, code: completeCode })
      window.localStorage.setItem(AUTH_TOKEN_KEY, response.data.token)
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.data.user))
      showToast({ type: 'success', heading: 'Email verified!', subheading: response.message || 'Your account is ready. Let’s build your plan.' })
      onClose(); navigate('/onboarding', { replace: true })
    } catch (verificationError) {
      const message = verificationError instanceof Error ? verificationError.message : 'We could not verify that code. Please try again.'
      setLocalError(message); showToast({ type: 'error', heading: 'Verification failed', subheading: message })
    } finally { setIsVerifying(false) }
  }

  const handleResend = async () => {
    if (!canResend) return
    setLocalError(null); setIsResending(true); hideToast()
    try {
      const response = await resendVerification({ email })
      setCode(createEmptyCode()); setSecondsRemaining(initialResendSeconds); inputRefs.current[0]?.focus()
      showToast({ type: 'info', heading: 'New code sent', subheading: response.message || 'Check your email for a new verification code.' })
    } catch (resendError) {
      const message = resendError instanceof Error ? resendError.message : 'We could not resend the code. Please try again.'
      setLocalError(message); showToast({ type: 'error', heading: 'Code not sent', subheading: message })
    } finally { setIsResending(false) }
  }

  const formattedCountdown = `00:${String(secondsRemaining).padStart(2, '0')}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-['Inter',ui-sans-serif,system-ui,sans-serif]" onMouseDown={(event) => { if (event.target === event.currentTarget && !isBusy) onClose() }}>
      <div aria-describedby="email-verification-description" aria-labelledby="email-verification-title" aria-modal="true" className="relative min-h-[500px] w-full max-w-[818px] overflow-hidden rounded-[34px] bg-[#F5F3F6] shadow-[0_0_80px_10px_rgba(0,0,0,0.3)] md:h-[530px] md:min-h-0" role="dialog">
        <button aria-label="Close email verification" className="absolute right-[18px] top-[16px] z-30 grid size-[35px] place-items-center rounded-full transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] md:right-[17px] md:top-[16px]" disabled={isBusy} onClick={onClose} type="button">
          <img alt="" className="size-[27px] object-cover" draggable={false} src={closeIconSrc} />
        </button>
        <img alt="Rocco holding a phone" className="pointer-events-none absolute left-[417px] top-[39px] hidden h-[685px] w-[514px] max-w-none select-none object-cover md:block" draggable={false} src={mascotSrc} />
        <form className="relative z-10 flex min-h-[500px] w-full flex-col items-center px-6 pb-10 pt-[88px] md:absolute md:left-[23px] md:top-[62px] md:h-[444px] md:min-h-0 md:w-[483px] md:px-0 md:py-0" onSubmit={handleSubmit}>
          <header className="text-center md:absolute md:left-[56px] md:top-[70px] md:w-[372px]">
            <h2 className="text-[32px] font-bold leading-normal text-[#38323F] md:text-[38px]" id="email-verification-title">Verify Your Email</h2>
            <p className="mt-[7px] text-[13px] font-normal leading-normal text-[#7482A4] md:text-[14px]" id="email-verification-description">We sent a 6-digit verification code to <strong className="font-bold">{email}</strong></p>
          </header>
          <div aria-label="Six-digit verification code" className="mt-[52px] flex w-full max-w-[382px] justify-between md:absolute md:left-[51px] md:top-[171px] md:mt-0" onPaste={(event) => { event.preventDefault(); distributeDigits(event.clipboardData.getData('text')) }}>
            {code.map((digit, index) => (
              <input aria-label={`Verification code digit ${index + 1}`} autoComplete={index === 0 ? 'one-time-code' : 'off'} className="h-[37px] w-[46px] border-0 border-b border-[#38323F] bg-transparent p-0 text-center text-[22px] font-semibold leading-none text-[#38323F] caret-[#7482A4] outline-none transition-colors focus:border-b-2 focus:border-[#7482A4]" inputMode="numeric" key={index} maxLength={1} onChange={(event) => handleChange(index, event.target.value)} onFocus={(event) => event.currentTarget.select()} onKeyDown={(event) => handleInputKeyDown(index, event)} pattern="[0-9]*" ref={(element) => { inputRefs.current[index] = element }} type="text" value={digit} />
            ))}
          </div>
          <div className="mt-[30px] w-full max-w-[249px] text-center md:absolute md:left-[112px] md:top-[259px] md:mt-0">
            <button className="h-[33px] w-full rounded-[6px] bg-[#7482A4] text-[13px] font-bold leading-normal text-white shadow-[0_4px_7.2px_rgba(116,130,164,0.5)] transition hover:bg-[#687796] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60" disabled={!canVerify} type="submit">{isVerifying ? 'Verifying…' : 'Verify Email'}</button>
            <p className="mt-[23px] text-[11px] font-medium leading-normal text-[#38323F]">Didn’t receive the code? <button className="font-bold text-[#7482A4] disabled:cursor-not-allowed disabled:opacity-55" disabled={!canResend} onClick={handleResend} type="button">{isResending ? 'Sending…' : 'Resend Code'}</button></p>
            {secondsRemaining > 0 && <p className="mt-[3px] text-[10px] font-medium leading-normal text-[#38323F]/80">Resend available in <strong className="font-bold text-[#7482A4]">{formattedCountdown}</strong></p>}
            {localError && <p aria-live="polite" className="mt-3 text-[11px] font-medium leading-tight text-[#C25A63]">{localError}</p>}
          </div>
        </form>
      </div>
    </div>
  )
}