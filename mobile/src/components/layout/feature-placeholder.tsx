import { ScrollView, View } from 'react-native';
import { AppScreen } from './app-screen';
import { AppPageHero } from '@/components/mascot/app-page-hero';
import { AppCard } from '@/components/ui/app-card';
import { AppText } from '@/components/ui/app-text';
import { AppBadge } from '@/components/ui/app-badge';
import type { RoccoVariant } from '@/components/mascot/rocco-assets';
import { spacing } from '@/theme';

type FeaturePlaceholderProps = { title: string; description: string; mascot: RoccoVariant; phase: number };

export function FeaturePlaceholder({ title, description, mascot, phase }: FeaturePlaceholderProps) {
  return (
    <AppScreen>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxxl, gap: spacing.xl }}>
        <AppPageHero heading={title} description={description} mascot={mascot} />
        <AppCard inset="lg">
          <View style={{ gap: spacing.md }}>
            <AppBadge label={`Planned for Phase ${phase}`} />
            <AppText variant="cardTitle">This space is ready for its feature work.</AppText>
            <AppText variant="secondary" tone="secondary">The navigation and native design foundation are in place. No fitness data is connected in this preview.</AppText>
          </View>
        </AppCard>
      </ScrollView>
    </AppScreen>
  );
}
