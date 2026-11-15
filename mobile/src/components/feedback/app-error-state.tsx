import { View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { AppButton } from '@/components/ui/app-button';
import { spacing } from '@/theme';

type AppErrorStateProps = { title?: string; description: string; onRetry?: () => void };

export function AppErrorState({ title = 'That didn’t load', description, onRetry }: AppErrorStateProps) {
  return <View accessibilityRole="alert" style={{ alignItems: 'center', gap: spacing.md, padding: spacing.xl }}><AppText variant="cardTitle">{title}</AppText><AppText variant="secondary" tone="secondary" align="center">{description}</AppText>{onRetry ? <AppButton label="Try again" variant="secondary" onPress={onRetry} /> : null}</View>;
}
