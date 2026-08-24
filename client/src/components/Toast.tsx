import { useCallback, useEffect, useRef, useState } from 'react'

export type ToastType = 'success' | 'warning' | 'error' | 'info'
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

export interface ToastProps {
  type: ToastType
  heading: string
  subheading: string
  open?: boolean
  duration?: number
  position?: ToastPosition
  iconSrc?: string
  mascotSrc?: string
  mascotAlt?: string
  showCloseButton?: boolean
  showProgress?: boolean
  onClose?: () => void
  className?: string
}

const TYPE_STYLES: Record<ToastType, { label: string; titleClass: string; iconSrc: string; iconClass: string; mascotSrc: string; mascotClass: string; surfaceClass: string; glowClass: string; accentClass: string }> = {
  success: { label: 'Success', titleClass: 'text-[#6F9B83]', iconSrc: '/Toast/success-icon.png', iconClass: 'size-9', mascotSrc: '/Toast/success-mascot.png', mascotClass: '-left-1 h-[178px] w-[202px]', surfaceClass: 'from-[#6F9B83]/[0.10] via-white to-white', glowClass: 'bg-[#6F9B83]/20', accentClass: 'bg-[#6F9B83]' },
  warning: { label: 'Warning', titleClass: 'text-[#C6A45D]', iconSrc: '/Toast/warning-icon.png', iconClass: 'size-[38px]', mascotSrc: '/Toast/warning-mascot.png', mascotClass: 'left-0 h-[180px] w-[198px]', surfaceClass: 'from-[#C6A45D]/[0.11] via-white to-white', glowClass: 'bg-[#C6A45D]/20', accentClass: 'bg-[#C6A45D]' },
  error: { label: 'Error', titleClass: 'text-[#B96F78]', iconSrc: '/Toast/error-icon.png', iconClass: 'size-9', mascotSrc: '/Toast/error-mascot.png', mascotClass: 'left-0 h-[180px] w-[198px]', surfaceClass: 'from-[#B96F78]/[0.10] via-white to-white', glowClass: 'bg-[#B96F78]/20', accentClass: 'bg-[#B96F78]' },
  info: { label: 'Info', titleClass: 'text-[#7482A4]', iconSrc: '/Toast/info-icon.png', iconClass: 'size-9', mascotSrc: '/Toast/info-mascot.png', mascotClass: 'left-1 h-[182px] w-[196px]', surfaceClass: 'from-[#7482A4]/[0.11] via-white to-white', glowClass: 'bg-[#7482A4]/20', accentClass: 'bg-[#7482A4]' },
}

const POSITION_STYLES: Record<ToastPosition, string> = {
  'top-right': 'right-4 top-4 sm:right-6 sm:top-6',
  'top-left': 'left-4 top-4 sm:left-6 sm:top-6',
  'bottom-right': 'bottom-4 right-4 sm:bottom-6 sm:right-6',
  'bottom-left': 'bottom-4 left-4 sm:bottom-6 sm:left-6',
}

const HIDDEN_POSITION_STYLES: Record<ToastPosition, string> = {
  'top-right': 'translate-x-4 -translate-y-1',
  'top-left': '-translate-x-4 -translate-y-1',
  'bottom-right': 'translate-x-4 translate-y-1',
  'bottom-left': '-translate-x-4 translate-y-1',
}

export default function Toast({
  type,
  heading,
  subheading,
  open = true,
  duration = 4000,
  position = 'top-right',
  iconSrc,
  mascotSrc,
  mascotAlt = 'Rocco, the FitPilot coach',
  showCloseButton = false,
  showProgress = true,
  onClose,
  className = '',
}: ToastProps) {
  const [isRendered, setIsRendered] = useState(open)
  const [isEntered, setIsEntered] = useState(false)
  const closeTimeoutRef = useRef<number | null>(null)
  const style = TYPE_STYLES[type]

  const dismiss = useCallback(() => {
    if (closeTimeoutRef.current !== null) window.clearTimeout(closeTimeoutRef.current)
    setIsEntered(false)
    closeTimeoutRef.current = window.setTimeout(() => { setIsRendered(false); onClose?.() }, 260)
  }, [onClose])

  useEffect(() => () => { if (closeTimeoutRef.current !== null) window.clearTimeout(closeTimeoutRef.current) }, [])

  useEffect(() => {
    if (!open) {
      setIsEntered(false)
      const timeoutId = window.setTimeout(() => setIsRendered(false), 260)
      return () => window.clearTimeout(timeoutId)
    }
    setIsRendered(true)
    const frameId = window.requestAnimationFrame(() => setIsEntered(true))
    return () => window.cancelAnimationFrame(frameId)
  }, [open])

  useEffect(() => {
    if (!open || duration <= 0) return
    const timeoutId = window.setTimeout(dismiss, duration)
    return () => window.clearTimeout(timeoutId)
  }, [dismiss, duration, open])

  if (!isRendered) return null

  return (
    <div className={`pointer-events-none fixed z-[100] ${POSITION_STYLES[position]} ${className}`} role={type === 'error' ? 'alert' : 'status'} aria-live={type === 'error' ? 'assertive' : 'polite'} aria-atomic="true">
      <article data-toast-type={type} className={`pointer-events-auto relative min-h-[184px] w-[min(404px,calc(100vw-24px))] overflow-hidden rounded-[28px] border border-[#38323F]/[0.07] bg-gradient-to-br shadow-[0_22px_65px_rgba(56,50,63,0.16),0_4px_16px_rgba(116,130,164,0.10)] transition-all duration-300 ease-out motion-reduce:transition-none ${style.surfaceClass} ${isEntered ? 'translate-x-0 translate-y-0 scale-100 opacity-100' : `${HIDDEN_POSITION_STYLES[position]} scale-[0.985] opacity-0`}`}>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[47%] overflow-hidden">
          <span className={`absolute -bottom-20 left-1/2 size-[230px] -translate-x-1/2 rounded-full blur-2xl ${style.glowClass}`} aria-hidden="true" />
          <img src={mascotSrc ?? style.mascotSrc} alt={mascotAlt} draggable={false} className={`absolute bottom-0 max-w-none select-none object-contain object-bottom ${style.mascotClass}`} />
        </div>

        <div className={`ml-[46%] flex min-h-[184px] flex-col justify-center py-7 pl-4 ${showCloseButton ? 'pr-12' : 'pr-7'}`}>
          <div className="flex items-center gap-3">
            <img src={iconSrc ?? style.iconSrc} alt="" aria-hidden="true" draggable={false} className={`shrink-0 select-none object-contain ${style.iconClass}`} />
            <p className={`text-[22px] font-bold leading-none tracking-[-0.025em] ${style.titleClass}`}>{style.label}</p>
          </div>
          <h2 className="mt-[18px] max-w-[205px] text-[15px] font-bold leading-[1.2] tracking-[-0.012em] text-[#38323F]">{heading}</h2>
          <p className="mt-1.5 max-w-[205px] text-[12px] font-medium leading-[1.38] text-[#6F6975]">{subheading}</p>
        </div>

        {showCloseButton && (
          <button type="button" onClick={dismiss} className="absolute right-3.5 top-3.5 grid size-8 place-items-center rounded-full border border-[#7482A4]/10 bg-white/70 text-[19px] leading-none text-[#7482A4] shadow-sm backdrop-blur-sm transition hover:border-[#7482A4]/20 hover:bg-white hover:text-[#38323F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4]/40" aria-label="Close notification">
            ×
          </button>
        )}

        {showProgress && duration > 0 && (
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-[#38323F]/[0.05]" aria-hidden="true">
            <span className={`block h-full origin-left ease-linear ${style.accentClass}`} style={{ transform: isEntered ? 'scaleX(0)' : 'scaleX(1)', transitionDuration: `${duration}ms`, transitionProperty: 'transform' }} />
          </div>
        )}
      </article>
    </div>
  )
}