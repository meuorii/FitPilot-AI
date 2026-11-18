import { useEffect, useState } from 'react';
import { AppState, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { router, useIsFocused } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { cancelAnimation, interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { AppScreen } from '@/components/layout/app-screen';
import { Entrance } from '@/components/motion/entrance';
import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { RoccoImage } from '@/components/mascot/rocco-image';
import { useAuth } from '@/lib/auth/auth-provider';
import { radius, spacing, useAppColors } from '@/theme';

const phrases = ["You've got this!", 'Ready when you are!', 'One step at a time.', "Let's get moving!"];

export default function AuthWelcomeScreen() {
  const colors = useAppColors();
  const { notice, clearNotice } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const mascotWidth = Math.min(320, windowWidth - spacing.xl * 2);
  const [phraseIndex, setPhraseIndex] = useState(-1);
  const focused = useIsFocused();
  const reducedMotion = useReducedMotion();
  const idle = useSharedValue(0);
  const greeting = useSharedValue(0);

  useEffect(() => {
    const startIdle = () => {
      if (focused && AppState.currentState === 'active' && !reducedMotion) {
        idle.set(withRepeat(withTiming(1, { duration: 2400 }), -1, true));
      } else {
        cancelAnimation(idle);
        idle.set(0);
      }
    };
    startIdle();
    const subscription = AppState.addEventListener('change', startIdle);
    return () => {
      subscription.remove();
      cancelAnimation(idle);
      idle.set(0);
    };
  }, [focused, idle, reducedMotion]);

  const roccoMotion = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(idle.get(), [0, 1], [0, -4]) + greeting.get() },
      { scale: interpolate(greeting.get(), [-5, 0], [1.015, 1]) },
    ],
  }));

  const greet = () => {
    setPhraseIndex((current) => (current + 1) % phrases.length);
    if (!reducedMotion) greeting.set(withSequence(withTiming(-5, { duration: 100 }), withTiming(0, { duration: 160 })));
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  };

  return (
    <AppScreen safeTop safeBottom>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, gap: spacing.xl }}>
        <Entrance style={{ alignItems: 'center', paddingTop: spacing.xs }}>
          <AppText variant="sectionTitle" style={{ letterSpacing: -0.4 }}>FitPilot</AppText>
        </Entrance>

        <View style={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.xl }}>
          <Entrance delay={50} style={{ width: '100%', maxWidth: 420, alignItems: 'center' }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Say hello to Rocco" accessibilityHint="Tap for a little encouragement." onPress={greet} style={({ pressed }) => ({ width: '100%', paddingVertical: spacing.lg, backgroundColor: colors.surfaceTint, borderRadius: radius.xl, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed && !reducedMotion ? 0.985 : 1 }] })}>
              <Animated.View style={roccoMotion}>
                <RoccoImage variant="welcome" width={mascotWidth} height={mascotWidth * 0.75} decorative />
              </Animated.View>
            </Pressable>
          </Entrance>

          <Entrance delay={110} style={{ width: '100%', maxWidth: 380, alignItems: 'center', gap: spacing.sm }}>
            <AppText variant="display" align="center">Your progress starts here.</AppText>
            <AppText variant="body" tone="secondary" align="center">Train smarter. Fuel better. Build a stronger you with FitPilot AI.</AppText>
            {phraseIndex >= 0 ? <AppText accessibilityLiveRegion="polite" variant="secondary" tone="accent" align="center" style={{ minHeight: 21 }}>{phrases[phraseIndex]}</AppText> : null}
            {notice ? <AppText accessibilityRole="alert" variant="secondary" tone="secondary" align="center">{notice}</AppText> : null}
          </Entrance>
        </View>

        <Entrance delay={170} style={{ width: '100%', maxWidth: 420, alignSelf: 'center', gap: spacing.sm }}>
          <AppButton label="Get started" onPress={() => { clearNotice(); router.push('/(auth)/register'); }} />
          <AppButton label="I already have an account" variant="quiet" onPress={() => router.push('/(auth)/login')} />
        </Entrance>
      </ScrollView>
    </AppScreen>
  );
}
