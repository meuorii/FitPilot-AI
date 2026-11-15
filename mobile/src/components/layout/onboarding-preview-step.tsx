import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { AppScreen } from './app-screen';
import { AppText } from '@/components/ui/app-text';
import { AppButton } from '@/components/ui/app-button';
import { AppBadge } from '@/components/ui/app-badge';
import { spacing } from '@/theme';

type OnboardingPreviewStepProps = { title: string; description: string; next?: Href; previous?: boolean; nextLabel?: string };

export function OnboardingPreviewStep({ title, description, next, previous, nextLabel = 'Continue preview' }: OnboardingPreviewStepProps) {
  return (
    <AppScreen safeTop>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.xl }}>
        <View style={{ gap: spacing.md }}>
          <AppBadge label="ONBOARDING PREVIEW · NO DATA SAVED" />
          <AppText variant="display">{title}</AppText>
          <AppText variant="secondary" tone="secondary">{description}</AppText>
          {next ? <AppButton label={nextLabel} style={{ marginTop: spacing.md }} onPress={() => router.push(next)} /> : null}
          {previous ? <AppButton label="Previous step" variant="quiet" onPress={() => router.back()} /> : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
}
