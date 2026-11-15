import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useAppColors, radius, spacing } from '@/theme';
import type { PropsWithChildren } from 'react';

type AppCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  inset?: keyof typeof spacing;
  tint?: boolean;
}>;

export function AppCard({ children, style, inset = 'xl', tint = false }: AppCardProps) {
  const colors = useAppColors();
  return (
    <View style={[{ padding: spacing[inset], borderRadius: radius.lg, backgroundColor: tint ? colors.surfaceTint : colors.surface, borderWidth: tint ? 0 : 1, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}
