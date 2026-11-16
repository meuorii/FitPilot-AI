import { Redirect, type Href } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { AppScreen } from '@/components/layout/app-screen';
import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { AppLoadingState } from '@/components/feedback/app-loading-state';
import { RoccoImage } from '@/components/mascot/rocco-image';
import { useAuth } from '@/lib/auth/auth-provider';
import { spacing } from '@/theme';

export default function IndexRoute() {
  const { status, notice, retrySession, logout } = useAuth();
  if (status === 'signedOut' || status === 'sessionExpired') return <Redirect href={'/(auth)/welcome' as Href} />;
  if (status === 'verificationPending') return <Redirect href="/(verification)/email" />;
  if (status === 'signedInOnboarding') return <Redirect href="/(onboarding)/welcome" />;
  if (status === 'signedInSummary') return <Redirect href="/(onboarding)/plan-summary" />;
  if (status === 'signedInReady') return <Redirect href="/(app)/(tabs)" />;

  return (
    <AppScreen safeTop safeBottom>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.xl }}>
        <View style={{ alignItems: 'center', gap: spacing.md }}>
          <RoccoImage variant="coachAvatar" width={92} height={92} decorative />
          <AppText variant="display" align="center">FitPilot</AppText>
          {status === 'hydrating' || status === 'checkingSession' ? <AppLoadingState label={status === 'hydrating' ? 'Preparing your account' : 'Checking your session'} /> : null}
          {status === 'sessionUnavailable' || status === 'storageUnavailable' ? <>
            <AppText variant="sectionTitle" align="center">{status === 'sessionUnavailable' ? 'We could not check your session.' : 'Secure sign-in is unavailable.'}</AppText>
            {notice ? <AppText variant="secondary" tone="secondary" align="center">{notice}</AppText> : null}
            <AppButton label="Try again" onPress={() => void retrySession()} />
            {status === 'sessionUnavailable' ? <AppButton label="Sign out on this device" variant="quiet" onPress={() => void logout().catch(() => undefined)} /> : null}
          </> : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
}
