import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '@/components/layout/app-screen';
import { AppPageHero } from '@/components/mascot/app-page-hero';
import { AppCard } from '@/components/ui/app-card';
import { AppText } from '@/components/ui/app-text';
import { AppButton } from '@/components/ui/app-button';
import { spacing } from '@/theme';

export default function SettingsPreviewScreen() {
  return (
    <AppScreen safeBottom>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxl, gap: spacing.xl }}>
        <AppPageHero heading="Settings" description="Your profile and preferences will live here." mascot="settings" />
        <AppCard inset="lg">
          <View style={{ gap: spacing.md }}>
            <AppText variant="cardTitle">Account settings are not connected yet.</AppText>
            <AppText variant="secondary" tone="secondary">This preview does not change account data or sign you out.</AppText>
            <AppButton label="Back to FitPilot" variant="secondary" onPress={() => router.back()} />
          </View>
        </AppCard>
      </ScrollView>
    </AppScreen>
  );
}
