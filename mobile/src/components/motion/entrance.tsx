import type { PropsWithChildren } from 'react';
import Animated, { FadeInUp, useReducedMotion } from 'react-native-reanimated';
import type { ViewStyle } from 'react-native';

export function Entrance({ children, delay = 0, style }: PropsWithChildren<{ delay?: number; style?: ViewStyle }>) {
  const reducedMotion = useReducedMotion();
  return (
    <Animated.View entering={reducedMotion ? undefined : FadeInUp.duration(280).delay(delay)} style={style}>
      {children}
    </Animated.View>
  );
}
