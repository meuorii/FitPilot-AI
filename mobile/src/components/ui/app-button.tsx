import { ActivityIndicator, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAppColors, spacing, radius } from '@/theme';
import { AppText } from './app-text';

type AppButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: 'primary' | 'secondary' | 'quiet';
  loading?: boolean;
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({ label, variant = 'primary', loading = false, disabled, haptic, style, ...props }: AppButtonProps) {
  const colors = useAppColors();
  const unavailable = Boolean(disabled || loading);
  const isPrimary = variant === 'primary';
  const background = isPrimary ? colors.accentStrong : variant === 'secondary' ? colors.surface : 'transparent';
  const foreground = isPrimary ? colors.onAccent : colors.text;
  const onPressIn = (event: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) => {
    if (!unavailable && (haptic ?? isPrimary)) void Haptics.selectionAsync().catch(() => undefined);
    props.onPressIn?.(event);
  };
  const onPress = (event: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
    props.onPress?.(event);
  };

  return (
    <Pressable
      {...props}
      onPressIn={onPressIn}
      onPress={onPress}
      disabled={unavailable}
      accessibilityRole="button"
      accessibilityState={{ disabled: unavailable, busy: loading }}
      style={({ pressed }) => [
        { minHeight: 48, paddingHorizontal: spacing.xl, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.xs, backgroundColor: unavailable ? colors.disabled : pressed && isPrimary ? colors.accentPressed : background, borderWidth: variant === 'secondary' ? 1 : 0, borderColor: colors.border, opacity: pressed && !isPrimary && !unavailable ? 0.72 : 1 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={foreground} size="small" /> : null}
      <AppText variant="button" style={{ color: foreground }}>{label}</AppText>
    </Pressable>
  );
}
