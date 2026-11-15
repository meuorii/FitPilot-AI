import { View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText } from '@/components/ui/app-text';
import { AppButton } from '@/components/ui/app-button';
import { useAppColors, spacing } from '@/theme';

export function AppOfflineState({ onRetry }: { onRetry?: () => void }) {
  const colors = useAppColors();
  return (
    <View accessibilityRole="alert" style={{ alignItems: 'center', gap: spacing.md, padding: spacing.xl }}>
      <Ionicons name="cloud-offline-outline" size={26} color={colors.textSecondary} accessibilityElementsHidden />
      <AppText variant="cardTitle">You’re offline</AppText>
      <AppText variant="secondary" tone="secondary" align="center">Connect to the internet to load the latest FitPilot information. An empty screen here does not mean your account has no data.</AppText>
      {onRetry ? <AppButton label="Try again" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}
