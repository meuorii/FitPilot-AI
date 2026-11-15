import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppColors } from '@/theme';
import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

type AppScreenProps = PropsWithChildren<{
  safeTop?: boolean;
  safeBottom?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export function AppScreen({ children, safeTop = false, safeBottom = false, style }: AppScreenProps) {
  const colors = useAppColors();
  const edges = [
    ...(safeTop ? ['top' as const] : []),
    ...(safeBottom || safeTop ? ['bottom' as const] : []),
    'left' as const,
    'right' as const,
  ];
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: colors.background }, style]}>
      {children}
    </SafeAreaView>
  );
}
