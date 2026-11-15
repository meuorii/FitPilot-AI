import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '@/components/layout/app-screen';
import { AppPageHero } from '@/components/mascot/app-page-hero';
import { AppCard } from '@/components/ui/app-card';
import { AppBadge } from '@/components/ui/app-badge';
import { AppText } from '@/components/ui/app-text';
import { AppSectionHeader } from '@/components/ui/app-section-header';
import { AppButton } from '@/components/ui/app-button';
import { AppDivider } from '@/components/ui/app-divider';
import { spacing } from '@/theme';

export default function HomePreviewScreen() {
  return (
    <AppScreen>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxl, gap: spacing.xl }}>
        {__DEV__ ? <AppBadge label="DEVELOPER PREVIEW · NO ACCOUNT CONNECTED" /> : null}
        <AppText variant="display">Welcome to FitPilot.</AppText>
        <AppPageHero heading="A little more focus, every day." description="A native home for the habits that move you forward." mascot="dashboard" />

        <View style={{ gap: spacing.md }}>
          <AppSectionHeader title="Mobile foundation" detail="The shell is in place. Fitness data will connect in later phases." />
          <AppCard inset="lg">
            <View style={{ gap: spacing.md }}>
              <AppText variant="cardTitle">Explore the FitPilot workspace</AppText>
              <AppText variant="secondary" tone="secondary">Use the tabs to preview the native structure. These screens contain no personal or sample workout data.</AppText>
              <AppDivider />
              <AppButton label="Preview workouts" variant="secondary" onPress={() => router.navigate('/(app)/(tabs)/workouts')} />
              <AppButton label="Preview meals" variant="quiet" onPress={() => router.navigate('/(app)/(tabs)/meals')} />
            </View>
          </AppCard>
        </View>

        {__DEV__ ? (
          <AppCard inset="lg" tint>
            <View style={{ gap: spacing.md }}>
              <AppText variant="cardTitle">Route previews</AppText>
              <AppText variant="secondary" tone="secondary">These development-only routes demonstrate navigation. They do not authenticate or save information.</AppText>
              <AppButton label="Authentication placeholder" variant="secondary" onPress={() => router.push('/(auth)/login')} />
              <AppButton label="Verification placeholder" variant="quiet" onPress={() => router.push('/(verification)/email')} />
              <AppButton label="Onboarding placeholder" variant="quiet" onPress={() => router.push('/(onboarding)/welcome')} />
            </View>
          </AppCard>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}
