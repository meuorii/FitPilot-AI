import { View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText } from '@/components/ui/app-text';
import { AppButton } from '@/components/ui/app-button';
import { useAppColors, spacing } from '@/theme';

type AppEmptyStateProps = { title: string; description: string; actionLabel?: string; onAction?: () => void };

export function AppEmptyState({ title, description, actionLabel, onAction }: AppEmptyStateProps) {
  const colors = useAppColors();
  return <View style={{ alignItems: 'center', gap: spacing.md, padding: spacing.xl }}><Ionicons name="ellipse-outline" size={26} color={colors.accentStrong} accessibilityElementsHidden /><AppText variant="cardTitle" align="center">{title}</AppText><AppText variant="secondary" tone="secondary" align="center">{description}</AppText>{actionLabel && onAction ? <AppButton label={actionLabel} variant="secondary" onPress={onAction} /> : null}</View>;
}
