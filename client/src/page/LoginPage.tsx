import LoginForm, { type LoginCredentials } from '../components/Login/LoginForm';

const ROCCO_ARTWORK = 'https://www.figma.com/api/mcp/asset/213433f2-3d9f-4bbd-8c9f-264276cfa85f.png';

export default function LoginPage() {
  const handleLogin = (credentials: LoginCredentials) => {
    console.info('Login submitted', { email: credentials.email, rememberMe: credentials.rememberMe });
  };

  return (
    <main className="min-h-dvh w-full overflow-x-hidden bg-[#F5F3F6] px-[clamp(20px,6vw,24px)] py-5 font-['Inter',ui-sans-serif,system-ui,sans-serif] sm:py-6 lg:h-dvh lg:overflow-hidden lg:px-[clamp(24px,4vw,58px)] lg:py-[clamp(20px,4vh,44px)]">
      <div className="mx-auto flex w-full max-w-[1332px] flex-col items-center gap-10 lg:h-full lg:flex-row lg:gap-[clamp(28px,2.9vw,42px)]">
        <figure className="m-0 h-[clamp(260px,42dvh,420px)] w-full max-w-[560px] shrink-0 overflow-hidden rounded-[32px] shadow-[0_0_80px_10px_rgba(0,0,0,0.15)] lg:h-auto lg:max-w-[754px] lg:aspect-[754/943] lg:w-[min(calc((100dvh_-_clamp(40px,_8vh,_88px))_*_0.799575),_calc(100%_-_clamp(350px,_35vw,_535px)_-_clamp(28px,_2.9vw,_42px)))] lg:rounded-[clamp(44px,4.2vw,60px)]">
          <img
            src={ROCCO_ARTWORK}
            alt="Rocco, the FitPilot wolf mascot, surrounded by healthy food and workout equipment"
            draggable={false}
            className="h-full w-full select-none object-cover object-center"
          />
        </figure>

        <section className="flex w-full flex-1 items-center justify-center lg:h-full lg:min-h-0">
          <LoginForm onSubmit={handleLogin} />
        </section>
      </div>
    </main>
  );
}