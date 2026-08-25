import RegisterForm, { type RegisterCredentials } from '../components/Auth/RegisterForm'

const REGISTER_ARTWORK = '/Auth/Register/image.png'

export default function RegisterPage() {
  const handleRegister = async (credentials: RegisterCredentials) => {
    console.info('Registration submitted', { fullName: credentials.fullName, email: credentials.email })
  }

  const handleLogin = () => {
    window.location.assign('/login')
  }

  return (
    <>
      <style>{`
        @keyframes register-rise-in { from { opacity: 0; translate: 0 18px; } to { opacity: 1; translate: 0 0; } }
        @keyframes register-artwork-enter { from { opacity: 0; translate: 0 22px; scale: 0.985; } to { opacity: 1; translate: 0 0; scale: 1; } }
        @keyframes register-artwork-settle { from { scale: 1.035; } to { scale: 1; } }
        @keyframes register-icon-pop { from { opacity: 0; scale: 0.72; } to { opacity: 1; scale: 1; } }
        .register-artwork-panel { animation: register-artwork-enter 760ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .register-artwork-image { animation: register-artwork-settle 1100ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .register-form-shell { animation: register-rise-in 650ms cubic-bezier(0.22, 1, 0.36, 1) 100ms both; }
        .register-stagger-item { animation: register-rise-in 540ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .register-stagger-1 { animation-delay: 170ms; }
        .register-stagger-2 { animation-delay: 225ms; }
        .register-stagger-3 { animation-delay: 280ms; }
        .register-stagger-4 { animation-delay: 335ms; }
        .register-stagger-5 { animation-delay: 390ms; }
        .register-stagger-6 { animation-delay: 445ms; }
        .register-stagger-7 { animation-delay: 500ms; }
        .register-password-icon { animation: register-icon-pop 180ms ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .register-artwork-panel, .register-artwork-image, .register-form-shell, .register-stagger-item, .register-password-icon { animation: none; }
        }
      `}</style>
      <main className="min-h-dvh w-full overflow-x-hidden bg-[#F5F3F6] px-5 py-5 font-['Inter',ui-sans-serif,system-ui,sans-serif] sm:px-6 sm:py-6 lg:h-dvh lg:overflow-hidden lg:px-[clamp(24px,4vw,58px)] lg:py-[clamp(20px,4vh,44px)]">
        <div className="mx-auto flex w-full max-w-[1332px] flex-col items-center gap-10 lg:h-full lg:min-h-0 lg:flex-row lg:gap-[clamp(28px,2.9vw,42px)]">
          <figure className="register-artwork-panel m-0 h-[clamp(260px,42dvh,420px)] w-full max-w-[560px] shrink-0 overflow-hidden rounded-[32px] bg-[#ECEAF1] shadow-[0_0_80px_10px_rgba(56,50,63,0.15)] lg:aspect-[754/943] lg:h-auto lg:max-h-[943px] lg:max-w-[754px] lg:w-[min(calc((100dvh_-_clamp(40px,_8vh,_88px))_*_0.799575),_calc(100%_-_clamp(350px,_35vw,_535px)_-_clamp(28px,_2.9vw,_42px)))] lg:rounded-[clamp(44px,4.2vw,60px)]">
            <img src={REGISTER_ARTWORK} alt="Rocco getting ready for training, surrounded by healthy meals and workout equipment" draggable={false} className="register-artwork-image h-full w-full select-none object-cover object-center" />
          </figure>
          <section className="register-form-shell flex w-full flex-1 items-center justify-center lg:h-full lg:min-h-0 lg:min-w-[350px]">
            <RegisterForm onSubmit={handleRegister} onLogin={handleLogin} />
          </section>
        </div>
      </main>
    </>
  )
}