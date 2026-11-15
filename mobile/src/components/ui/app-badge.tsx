import { View } from 'react-native';
import { AppText } from './app-text';
import { useAppColors, radius, spacing } from '@/theme';

export function AppBadge({ label }: { label: string }) {
  const colors = useAppColors();
  return <View style={{ alignSelf: 'flex-start', backgroundColor: colors.surfaceTint, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}><AppText variant="caption" tone="secondary">{label}</AppText></View>;
}
