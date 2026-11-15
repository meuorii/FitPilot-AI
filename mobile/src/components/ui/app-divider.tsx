import { View } from 'react-native';
import { useAppColors } from '@/theme';

export function AppDivider() {
  const colors = useAppColors();
  return <View accessibilityElementsHidden style={{ height: 1, backgroundColor: colors.divider }} />;
}
