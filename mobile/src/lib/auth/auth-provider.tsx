import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { queryClient } from '@/lib/query/query-client';
import { ApiError, setUnauthorizedHandler } from '@/lib/api/api-client';
import { authApi } from './auth-api';
import { secureTokenStore } from './secure-token-store';
import type { AuthUser, Profile } from './auth-types';

export type AuthStatus =
  | 'hydrating'
  | 'signedOut'
  | 'sessionExpired'
  | 'verificationPending'
  | 'authenticating'
  | 'checkingSession'
  | 'signedInOnboarding'
  | 'signedInSummary'
  | 'signedInReady'
  | 'sessionUnavailable'
  | 'storageUnavailable';

type AuthValue = {
  status: AuthStatus;
  user: AuthUser | null;
  profile: Profile | null;
  verificationEmail: string | null;
  notice: string | null;
  beginVerification: (email: string) => void;
  clearVerification: () => void;
  startAuthentication: () => void;
  finishAuthentication: () => void;
  establishSession: (token: string, user: AuthUser) => Promise<Profile | null>;
  updateProfile: (profile: Profile, showSummary?: boolean) => void;
  finishOnboarding: () => void;
  retrySession: () => Promise<void>;
  logout: () => Promise<void>;
  clearNotice: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

function isTemporaryFailure(error: unknown) {
  return !(error instanceof ApiError) || error.status === 0 || error.status >= 500;
}

export function AuthBootstrapProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('hydrating');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const revision = useRef(0);
  const mounted = useRef(true);
  const storageFailureMode = useRef<'restore' | 'clear'>('restore');

  const clearInvalidSession = useCallback(async (token: string, message = 'Your session ended. Sign in again to continue.') => {
    let currentToken: string | null;
    try {
      currentToken = await secureTokenStore.get();
    } catch {
      revision.current += 1;
      await queryClient.cancelQueries();
      queryClient.clear();
      storageFailureMode.current = 'clear';
      if (mounted.current) {
        setUser(null);
        setProfile(null);
        setStatus('storageUnavailable');
        setNotice('This session is no longer valid, but secure storage is unavailable. Retry to finish signing out.');
      }
      return;
    }
    if (currentToken && currentToken !== token) return;
    revision.current += 1;
    await queryClient.cancelQueries();
    queryClient.clear();
    try {
      if (currentToken) await secureTokenStore.clear();
      storageFailureMode.current = 'restore';
    } catch {
      storageFailureMode.current = 'clear';
      if (!mounted.current) return;
      setUser(null);
      setProfile(null);
      setStatus('storageUnavailable');
      setNotice('This session is no longer valid, but FitPilot could not clear it from secure storage. Retry to finish signing out.');
      return;
    }
    if (!mounted.current) return;
    setUser(null);
    setProfile(null);
    setVerificationEmail(null);
    setNotice(message);
    setStatus('sessionExpired');
  }, []);

  const validateStoredSession = useCallback(async (token: string, candidateUser?: AuthUser): Promise<Profile | null> => {
    const currentRevision = ++revision.current;
    setStatus('checkingSession');
    setNotice(null);
    if (candidateUser) setUser(candidateUser);
    setProfile(null);
    try {
      const savedProfile = await authApi.profile();
      if (revision.current !== currentRevision || !mounted.current) return null;
      if (savedProfile.email_verified !== true) {
        await clearInvalidSession(token, 'Verify your email before using FitPilot.');
        return null;
      }
      setUser(savedProfile);
      setProfile(savedProfile);
      setStatus(savedProfile.is_onboarded ? 'signedInReady' : 'signedInOnboarding');
      return savedProfile;
    } catch (error) {
      if (revision.current !== currentRevision || !mounted.current) return null;
      if (isTemporaryFailure(error)) {
        setStatus('sessionUnavailable');
        setNotice('FitPilot could not check your session. Your saved sign-in is still on this device. Check your connection and retry.');
        return null;
      }
      await clearInvalidSession(token);
      return null;
    }
  }, [clearInvalidSession]);

  const restore = useCallback(async () => {
    try {
      const token = await secureTokenStore.get();
      if (!token) {
        queryClient.clear();
        setUser(null);
        setProfile(null);
        setVerificationEmail(null);
        setStatus('signedOut');
        return;
      }
      await validateStoredSession(token);
    } catch {
      if (mounted.current) {
        storageFailureMode.current = 'restore';
        setStatus('storageUnavailable');
        setNotice('Secure sign-in storage is unavailable. FitPilot cannot safely restore your account on this device.');
      }
    }
  }, [validateStoredSession]);

  const establishSession = useCallback(async (token: string, nextUser: AuthUser): Promise<Profile | null> => {
    await secureTokenStore.set(token);
    await queryClient.cancelQueries();
    queryClient.clear();
    setVerificationEmail(null);
    setUser(nextUser);
    return validateStoredSession(token, nextUser);
  }, [validateStoredSession]);

  const beginVerification = useCallback((email: string) => {
    revision.current += 1;
    setUser(null);
    setProfile(null);
    setVerificationEmail(email.trim().toLowerCase());
    setNotice(null);
    setStatus('verificationPending');
  }, []);

  const clearVerification = useCallback(() => {
    setVerificationEmail(null);
    setStatus('signedOut');
  }, []);

  const startAuthentication = useCallback(() => {
    setNotice(null);
    setStatus('authenticating');
  }, []);
  const finishAuthentication = useCallback(() => {
    setStatus((current) => current === 'authenticating' ? 'signedOut' : current);
  }, []);

  const updateProfile = useCallback((nextProfile: Profile, showSummary = false) => {
    setProfile(nextProfile);
    setUser(nextProfile);
    setStatus(nextProfile.is_onboarded ? (showSummary ? 'signedInSummary' : 'signedInReady') : 'signedInOnboarding');
  }, []);

  const finishOnboarding = useCallback(() => {
    if (profile?.is_onboarded) setStatus('signedInReady');
  }, [profile]);

  const retrySession = useCallback(async () => {
    if (status === 'storageUnavailable') {
      if (storageFailureMode.current === 'clear') {
        try {
          await secureTokenStore.clear();
          await queryClient.cancelQueries();
          queryClient.clear();
          storageFailureMode.current = 'restore';
          setUser(null);
          setProfile(null);
          setVerificationEmail(null);
          setNotice(null);
          setStatus('signedOut');
        } catch {
          setNotice('Secure sign-in storage is still unavailable. Retry when device security is available.');
        }
        return;
      }
      setStatus('hydrating');
      setNotice(null);
      await restore();
      return;
    }
    try {
      const token = await secureTokenStore.get();
      if (!token) {
        await queryClient.cancelQueries();
        queryClient.clear();
        setUser(null);
        setProfile(null);
        setVerificationEmail(null);
        setNotice('Your saved sign-in is no longer available. Sign in again to continue.');
        setStatus('signedOut');
        return;
      }
      await validateStoredSession(token, user ?? undefined);
    } catch {
      setStatus('storageUnavailable');
      setNotice('Secure sign-in storage is unavailable. Try again when device security is available.');
    }
  }, [restore, status, user, validateStoredSession]);

  const logout = useCallback(async () => {
    revision.current += 1;
    await queryClient.cancelQueries();
    queryClient.clear();
    try {
      await secureTokenStore.clear();
      storageFailureMode.current = 'restore';
      setUser(null);
      setProfile(null);
      setVerificationEmail(null);
      setNotice(null);
      setStatus('signedOut');
    } catch {
      storageFailureMode.current = 'clear';
      setStatus('storageUnavailable');
      setNotice('FitPilot could not clear your secure sign-in. Retry logout before handing off this device.');
      throw new Error('Secure sign-in could not be cleared.');
    }
  }, []);

  const clearNotice = useCallback(() => setNotice(null), []);

  useEffect(() => {
    mounted.current = true;
    setUnauthorizedHandler((token) => clearInvalidSession(token));
    let active = true;
    const startup = setTimeout(() => {
      if (active) void restore();
    }, 0);
    return () => {
      active = false;
      clearTimeout(startup);
      mounted.current = false;
      setUnauthorizedHandler(undefined);
    };
  }, [clearInvalidSession, restore]);

  const value = useMemo(() => ({
    status, user, profile, verificationEmail, notice, beginVerification, clearVerification, startAuthentication, finishAuthentication,
    establishSession, updateProfile, finishOnboarding, retrySession, logout, clearNotice,
  }), [status, user, profile, verificationEmail, notice, beginVerification, clearVerification, startAuthentication, finishAuthentication, establishSession, updateProfile, finishOnboarding, retrySession, logout, clearNotice]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthBootstrapProvider.');
  return value;
}
