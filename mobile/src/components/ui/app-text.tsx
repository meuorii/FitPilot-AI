import { Text, type TextProps, type TextStyle } from 'react-native';
import { useAppColors, typography } from '@/theme';

type Variant = keyof typeof typography;
type Tone = 'primary' | 'secondary' | 'muted' | 'accent' | 'error' | 'success';

type AppTextProps = TextProps & {
  variant?: Variant;
  tone?: Tone;
  align?: TextStyle['textAlign'];
};

export function AppText({ variant = 'body', tone = 'primary', align, style, ...props }: AppTextProps) {
  const colors = useAppColors();
  const toneColor = {
    primary: colors.text,
    secondary: colors.textSecondary,
    muted: colors.textMuted,
    accent: colors.accentStrong,
    error: colors.error,
    success: colors.success,
  }[tone];

  return <Text {...props} style={[typography[variant], { color: toneColor, textAlign: align }, style]} />;
}
