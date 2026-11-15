import { View } from 'react-native';
import { useAppColors, radius } from '@/theme';
import type { ViewStyle } from 'react-native';

export function AppSkeleton({ style }: { style?: ViewStyle }) {
  const colors = useAppColors();
  return <View accessible={false} style={[{ backgroundColor: colors.skeleton, borderRadius: radius.sm }, style]} />;
}
