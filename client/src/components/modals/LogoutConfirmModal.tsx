import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { LogOut, X } from 'lucide-react'

import roccoLogoutWave from '../../assets/images/rocco-logout-wave.png'

interface LogoutConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: LogoutConfirmModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cancelButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close logout confirmation"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#211E24]/55 backdrop-blur-[3px]"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        className="relative z-10 w-full max-w-[720px] overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_28px_90px_rgba(33,30,36,0.28)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-xl bg-[#F5F3F6] text-[#6F6A74] transition hover:bg-[#ECE9EE] hover:text-[#38323F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative flex min-h-[260px] items-end justify-center overflow-hidden bg-gradient-to-br from-[#F5F3F6] via-[#EEF0F5] to-[#E5E8F0] px-6 pt-8 md:min-h-[410px]">
            <div className="absolute left-7 top-7 rounded-full bg-white/80 px-3 py-1.5 text-xs font-extrabold tracking-wide text-[#7482A4] shadow-sm">
              SEE YOU SOON!
            </div>

            <div className="absolute -left-10 bottom-14 h-32 w-32 rounded-full bg-white/40 blur-2xl" />
            <div className="absolute -right-8 top-16 h-36 w-36 rounded-full bg-[#7482A4]/15 blur-2xl" />

            <img
              src={roccoLogoutWave}
              alt="Rocco waving goodbye"
              draggable={false}
              className="relative z-10 h-[250px] w-full select-none object-contain object-bottom sm:h-[290px] md:h-[350px]"
            />
          </div>

          <div className="flex flex-col justify-center p-6 pt-14 sm:p-8 sm:pt-14 md:p-10">
            <div className="max-w-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7482A4]">
                FitPilot
              </p>

              <h2
                id="logout-dialog-title"
                className="mt-3 text-2xl font-extrabold leading-tight text-[#38323F] sm:text-[30px]"
              >
                Are you sure you want to logout?
              </h2>

              <p
                id="logout-dialog-description"
                className="mt-3 text-sm leading-6 text-[#77727B] sm:text-[15px]"
              >
                You&apos;ll be signed out of your FitPilot account. Your workouts,
                meals, and progress are safe, and Rocco will be here when you return.
              </p>
            </div>

            <div className="mt-7 rounded-2xl border border-[#EAE7EC] bg-[#F8F7F9] p-4">
              <p className="text-sm font-bold text-[#38323F]">
                Your progress stays saved
              </p>
              <p className="mt-1 text-xs leading-5 text-[#817B85]">
                Logging out only ends this session. It does not delete your account or fitness data.
              </p>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={onClose}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#DDD9E0] bg-white px-4 text-sm font-bold text-[#38323F] transition hover:bg-[#F8F7F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onConfirm}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#7482A4] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(116,130,164,0.28)] transition hover:bg-[#667493] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2"
              >
                <LogOut className="h-4 w-4" strokeWidth={2} />
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  )
}
