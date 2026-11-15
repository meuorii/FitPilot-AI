import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { secureTokenStore } from './secure-token-store';

export type AuthBootstrapStatus = 'hydrating' | 'signedOut' | 'signedIn' | 'storageUnavailable';

type AuthBootstrapValue = { status: AuthBootstrapStatus; refresh: () => Promise<void> };
const AuthBootstrapContext = createContext<AuthBootstrapValue | null>(null);

async function readBootstrapStatus(): Promise<AuthBootstrapStatus> {
  try {
    return (await secureTokenStore.get()) ? 'signedIn' : 'signedOut';
  } catch {
    return 'storageUnavailable';
  }
}

export function AuthBootstrapProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthBootstrapStatus>('hydrating');

  const refresh = useCallback(async () => {
    setStatus('hydrating');
    setStatus(await readBootstrapStatus());
  }, []);

  useEffect(() => {
    let active = true;
    void readBootstrapStatus().then((nextStatus) => {
      if (active) setStatus(nextStatus);
    });
    return () => { active = false; };
  }, []);
  const value = useMemo(() => ({ status, refresh }), [status, refresh]);
  return <AuthBootstrapContext.Provider value={value}>{children}</AuthBootstrapContext.Provider>;
}

export function useAuthBootstrap() {
  const context = useContext(AuthBootstrapContext);
  if (!context) throw new Error('useAuthBootstrap must be used inside AuthBootstrapProvider.');
  return context;
}
