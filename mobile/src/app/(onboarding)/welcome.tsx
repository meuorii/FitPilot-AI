import { ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { AppScreen } from '@/components/layout/app-screen';
import { AppText } from '@/components/ui/app-text';
import { AppButton } from '@/components/ui/app-button';
import { RoccoImage } from '@/components/mascot/rocco-image';
import { OnboardingProgress } from '@/components/layout/onboarding-progress';
import { useAppColors, radius, spacing } from '@/theme';
import { useAuth } from '@/lib/auth/auth-provider';

export default function OnboardingWelcomeScreen() {
  const colors = useAppColors();
  const { status } = useAuth();
  if (status === 'signedInSummary') return <Redirect href="/(onboarding)/plan-summary" />;
  return (
    <AppScreen safeTop safeBottom>
      <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', padding: spacing.xl, gap: spacing.xxl }}>
        <OnboardingProgress step={1} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.xl }}>
          <View style={{ width: '100%', maxWidth: 360, minHeight: 230, alignItems: 'center', justifyContent: 'center', borderRadius: radius.xl, backgroundColor: colors.surfaceTint, borderCurve: 'continuous' }}>
            <RoccoImage variant="workout" width={220} height={230} decorative />
          </View>
          <View style={{ width: '100%', maxWidth: 380, alignItems: 'flex-start', gap: spacing.md }}>
            <AppText variant="display">Your fitness journey starts here.</AppText>
            <AppText variant="body" tone="secondary">Tell us a little about yourself. We’ll help you build a plan around your goals.</AppText>
          </View>
        </View>
        <AppButton label="Continue" onPress={() => router.push('/(onboarding)/about-you')} />
      </ScrollView>
    </AppScreen>
  );
}
