import type { PropsWithChildren } from 'react';
import Animated, { Easing, FadeIn, useReducedMotion } from 'react-native-reanimated';
import type { ViewStyle } from 'react-native';

export function Entrance({ children, delay = 0, style }: PropsWithChildren<{ delay?: number; style?: ViewStyle }>) {
  const reducedMotion = useReducedMotion();
  return (
    <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(200).easing(Easing.bezier(0.23, 1, 0.32, 1)).delay(Math.min(delay, 80))} style={style}>
      {children}
    </Animated.View>
  );
}
