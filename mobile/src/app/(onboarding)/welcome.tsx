import { ScrollView, View, useWindowDimensions } from 'react-native';
import { Redirect, router } from 'expo-router';
import { AppScreen } from '@/components/layout/app-screen';
import { AppText } from '@/components/ui/app-text';
import { AppButton } from '@/components/ui/app-button';
import { RoccoImage } from '@/components/mascot/rocco-image';
import { OnboardingProgress } from '@/components/layout/onboarding-progress';
import { Entrance } from '@/components/motion/entrance';
import { radius, spacing, useAppColors } from '@/theme';
import { useAuth } from '@/lib/auth/auth-provider';

export default function OnboardingWelcomeScreen() {
  const colors = useAppColors();
  const { width: windowWidth } = useWindowDimensions();
  const mascotWidth = Math.min(320, windowWidth - spacing.xl * 2);
  const { status } = useAuth();
  if (status === 'signedInSummary') return <Redirect href="/(onboarding)/plan-summary" />;
  return (
    <AppScreen safeTop safeBottom>
      <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', padding: spacing.xl, gap: spacing.xxl }}>
        <Entrance><OnboardingProgress step={1} /></Entrance>
        <Entrance delay={55} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.xl }}>
          <View style={{ width: '100%', maxWidth: 420, alignItems: 'center', backgroundColor: colors.surfaceTint, borderRadius: radius.xl, borderCurve: 'continuous', paddingVertical: spacing.md }}>
            <RoccoImage variant="onboardingWelcome" width={mascotWidth} height={mascotWidth * 0.75} decorative />
          </View>
          <View style={{ width: '100%', maxWidth: 380, alignItems: 'flex-start', gap: spacing.md }}>
            <AppText variant="display">Your fitness journey starts here.</AppText>
            <AppText variant="body" tone="secondary">Tell us a little about yourself. We’ll help you build a plan around your goals.</AppText>
          </View>
        </Entrance>
        <Entrance delay={110}><AppButton label="Continue" onPress={() => router.push('/(onboarding)/about-you')} /></Entrance>
      </ScrollView>
    </AppScreen>
  );
}
