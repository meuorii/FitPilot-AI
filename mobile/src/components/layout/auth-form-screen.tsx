import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, useWindowDimensions } from 'react-native';
import { AppScreen } from './app-screen';
import { RoccoImage } from '@/components/mascot/rocco-image';
import { Entrance } from '@/components/motion/entrance';
import { radius, spacing, useAppColors } from '@/theme';

export function AuthFormScreen({ mascot, children }: PropsWithChildren<{
  mascot: 'login' | 'register' | 'emailVerification';
}>) {
  const colors = useAppColors();
  const { width } = useWindowDimensions();
  const size = Math.min(mascot === 'login' ? 208 : 164, width * 0.5);

  return (
    <AppScreen safeTop safeBottom>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ backgroundColor: colors.surfaceTint, alignItems: 'center', paddingTop: spacing.sm, paddingBottom: mascot === 'emailVerification' ? spacing.xs : 0 }}>
            <Entrance><RoccoImage variant={mascot} width={size} height={size} decorative /></Entrance>
          </View>
          <View style={{ flexGrow: 1 }}>
            <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: radius.xl, backgroundColor: colors.surfaceTint }} />
            <View style={{ flexGrow: 1, backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, borderCurve: 'continuous', padding: spacing.xl }}>
              <View style={{ width: '100%', maxWidth: 440, alignSelf: 'center', gap: spacing.lg }}>
                {children}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}
