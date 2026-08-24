import { useState } from 'react';
import LoginForm, { type LoginCredentials } from '../components/Login/LoginForm';
import Toast, { type ToastType } from '../components/Toast';
import { loginUser } from '../services/api/auth';

const AUTH_TOKEN_KEY = 'fitpilot_token';
const AUTH_USER_KEY = 'fitpilot_user';

const ROCCO_ARTWORK = 'https://www.figma.com/api/mcp/asset/213433f2-3d9f-4bbd-8c9f-264276cfa85f.png';

interface LoginToast {
  type: ToastType;
  heading: string;
  subheading: string;
}

export default function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [toast, setToast] = useState<LoginToast | null>(null);

  const handleLogin = async ({ email, password, rememberMe }: LoginCredentials) => {
    setIsLoggingIn(true);
    setToast(null);

    try {
      const response = await loginUser({ email: email.trim(), password });
      const storage = rememberMe ? window.localStorage : window.sessionStorage;
      const previousStorage = rememberMe ? window.sessionStorage : window.localStorage;

      previousStorage.removeItem(AUTH_TOKEN_KEY);
      previousStorage.removeItem(AUTH_USER_KEY);
      storage.setItem(AUTH_TOKEN_KEY, response.data.token);
      storage.setItem(AUTH_USER_KEY, JSON.stringify(response.data.user));

      setToast({
        type: 'success',
        heading: 'Welcome back!',
        subheading: response.message || 'You\'re signed in and ready to continue your fitness journey.',
      });

      // Add your router navigation here, for example:
      // navigate(response.data.user.is_onboarded ? '/dashboard' : '/onboarding');
    } catch (error) {
      setToast({
        type: 'error',
        heading: 'Login failed',
        subheading: error instanceof Error ? error.message : 'The email or password you entered is incorrect.',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
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
            <LoginForm onSubmit={handleLogin} isLoading={isLoggingIn} />
          </section>
        </div>
      </main>

      {toast && (
        <Toast
          key={`${toast.type}-${toast.heading}-${toast.subheading}`}
          type={toast.type}
          heading={toast.heading}
          subheading={toast.subheading}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}