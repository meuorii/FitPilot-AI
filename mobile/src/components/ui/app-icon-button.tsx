import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { useAppColors, radius } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
type AppIconButtonProps = Omit<PressableProps, 'children' | 'style'> & { icon: IconName; label: string; size?: number; style?: StyleProp<ViewStyle> };

export function AppIconButton({ icon, label, size = 21, style, ...props }: AppIconButtonProps) {
  const colors = useAppColors();
  return (
    <Pressable {...props} accessibilityRole="button" accessibilityLabel={label} hitSlop={8} style={({ pressed }) => [{ width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? colors.surfaceTint : 'transparent' }, style]}>
      <Ionicons name={icon} size={size} color={colors.text} />
    </Pressable>
  );
}
