import { useEffect, useRef, type PropsWithChildren } from 'react';
import { useAuth } from '@/lib/auth/auth-provider';
import { useOnboardingDraft } from './onboarding-draft';

export function AccountDraftBoundary({ children }: PropsWithChildren) {
  const { user, status } = useAuth();
  const { resetDraft } = useOnboardingDraft();
  const previousId = useRef<string | null>(null);

  useEffect(() => {
    if (status === 'hydrating' || status === 'checkingSession') return;
    const nextId = user?.id ?? null;
    if (previousId.current !== nextId) resetDraft();
    previousId.current = nextId;
  }, [resetDraft, status, user?.id]);

  return children;
}
