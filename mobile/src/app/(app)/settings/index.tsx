import { Alert, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '@/components/layout/app-screen';
import { AppPageHero } from '@/components/mascot/app-page-hero';
import { AppCard } from '@/components/ui/app-card';
import { AppText } from '@/components/ui/app-text';
import { AppButton } from '@/components/ui/app-button';
import { useAuth } from '@/lib/auth/auth-provider';
import { spacing } from '@/theme';

export default function SettingsAccountScreen() {
  const { user, logout } = useAuth();

  const confirmLogout = () => Alert.alert('Sign out of FitPilot?', 'You will need to sign in again to use this account on this device.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign out', style: 'destructive', onPress: () => { void logout().then(() => router.replace('/(auth)/login')).catch(() => undefined); } },
  ]);

  return (
    <AppScreen safeBottom>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.xl }}>
        <AppPageHero heading="Your account" description="Manage your FitPilot session on this device." mascot="settings" />
        <AppCard inset="lg">
          <View style={{ gap: spacing.xs }}>
            <AppText variant="caption" tone="secondary">SIGNED IN AS</AppText>
            <AppText variant="cardTitle">{user?.full_name ?? 'FitPilot member'}</AppText>
            {user?.email ? <AppText variant="secondary" tone="secondary" selectable>{user.email}</AppText> : null}
          </View>
        </AppCard>
        <AppButton label="Sign out" variant="secondary" onPress={confirmLogout} />
          <AppButton label="Back to FitPilot" variant="quiet" onPress={() => router.back()} />
      </ScrollView>
    </AppScreen>
  );
}
