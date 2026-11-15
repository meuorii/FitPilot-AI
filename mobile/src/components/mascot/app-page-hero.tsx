import { View, useWindowDimensions } from 'react-native';
import type { ReactNode } from 'react';
import { AppCard } from '@/components/ui/app-card';
import { AppText } from '@/components/ui/app-text';
import { RoccoImage } from './rocco-image';
import type { RoccoVariant } from './rocco-assets';
import { spacing } from '@/theme';

type AppPageHeroProps = {
  heading: string;
  description: string;
  mascot: RoccoVariant;
  eyebrow?: string;
  action?: ReactNode;
  background?: 'brand' | 'surface';
};

export function AppPageHero({ heading, description, mascot, eyebrow, action, background = 'brand' }: AppPageHeroProps) {
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const imageWidth = Math.min(compact ? 108 : 132, width * (compact ? 0.34 : 0.38));
  const imageHeight = imageWidth * 1.24;

  return (
    <AppCard inset="lg" tint={background === 'brand'} style={{ overflow: 'hidden' }}>
      <View style={{ flexDirection: compact ? 'column' : 'row', alignItems: 'center', gap: spacing.md, minHeight: compact ? undefined : imageHeight }}>
        <View style={{ flex: 1, gap: spacing.xs, alignItems: compact ? 'center' : 'flex-start' }}>
          {eyebrow ? <AppText variant="caption" tone="accent">{eyebrow}</AppText> : null}
          <AppText variant="pageTitle" align={compact ? 'center' : 'left'}>{heading}</AppText>
          <AppText variant="secondary" tone="secondary" align={compact ? 'center' : 'left'}>{description}</AppText>
          {action ? <View style={{ marginTop: spacing.xs, alignSelf: compact ? 'stretch' : 'flex-start' }}>{action}</View> : null}
        </View>
        <RoccoImage variant={mascot} width={imageWidth} height={imageHeight} decorative />
      </View>
    </AppCard>
  );
}
