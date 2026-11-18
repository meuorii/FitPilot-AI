import { View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { useAppColors, radius, spacing } from '@/theme';

export function OnboardingProgress({ step }: { step: 1 | 2 | 3 | 4 }) {
  const colors = useAppColors();
  return (
    <View accessibilityRole="progressbar" accessibilityLabel={`Step ${step} of 4`} accessibilityValue={{ min: 1, max: 4, now: step }} style={{ gap: spacing.xs }}>
      <View style={{ flexDirection: 'row', gap: spacing.xs }}>
        {[1, 2, 3, 4].map((item) => <View key={item} style={{ flex: 1, height: 4, borderRadius: radius.pill, backgroundColor: item === step ? colors.accentStrong : item < step ? colors.accent : colors.surfaceTint }} />)}
      </View>
      <AppText variant="caption" tone="secondary">Step {step} of 4</AppText>
    </View>
  );
}
