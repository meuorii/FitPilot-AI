import { ActivityIndicator, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { useAppColors, spacing } from '@/theme';

export function AppLoadingState({ label = 'Loading' }: { label?: string }) {
  const colors = useAppColors();
  return <View accessibilityRole="progressbar" accessibilityLabel={label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xl }}><ActivityIndicator color={colors.accentStrong} /><AppText variant="secondary" tone="secondary">{label}</AppText></View>;
}
