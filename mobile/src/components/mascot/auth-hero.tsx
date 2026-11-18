import { View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { RoccoImage } from './rocco-image';
import type { RoccoVariant } from './rocco-assets';
import { useAppColors, spacing } from '@/theme';

type AuthHeroProps = { variant: RoccoVariant; compact?: boolean };

/** A colored, grounded stage for the waist-up auth portraits. */
export function AuthHero({ variant, compact = false }: AuthHeroProps) {
  const colors = useAppColors();
  const height = compact ? 196 : 232;
  const imageSize = compact ? 174 : 212;

  return (
    <View style={{ height, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden', backgroundColor: colors.surfaceTint, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
      <View style={{ position: 'absolute', top: spacing.md, left: spacing.xl }}>
        <AppText variant="caption" tone="accent" style={{ letterSpacing: 1.4, fontWeight: '800' }}>FITPILOT</AppText>
      </View>
      <RoccoImage variant={variant} width={imageSize} height={imageSize} decorative />
    </View>
  );
}
