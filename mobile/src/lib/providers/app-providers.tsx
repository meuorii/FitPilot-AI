import { useMemo, type PropsWithChildren } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { AuthBootstrapProvider } from '@/lib/auth/auth-provider';
import { OnboardingDraftProvider } from '@/lib/onboarding/onboarding-draft';
import { AccountDraftBoundary } from '@/lib/onboarding/account-draft-boundary';
import { queryClient } from '@/lib/query/query-client';
import { QueryRuntime } from '@/lib/query/query-runtime';
import { palette } from '@/theme';

export function AppProviders({ children }: PropsWithChildren) {
  const scheme = useColorScheme();
  const colors = palette[scheme === 'dark' ? 'dark' : 'light'];
  const navigationTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.accent,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.error,
      },
    };
  }, [colors, scheme]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <ThemeProvider value={navigationTheme}>
          <QueryClientProvider client={queryClient}>
            <QueryRuntime>
              <AuthBootstrapProvider><OnboardingDraftProvider><AccountDraftBoundary>{children}</AccountDraftBoundary></OnboardingDraftProvider></AuthBootstrapProvider>
            </QueryRuntime>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
