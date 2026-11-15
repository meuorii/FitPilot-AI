import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { router, Redirect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppScreen } from '@/components/layout/app-screen';
import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { useAppColors, radius, spacing } from '@/theme';
import { useAuth } from '@/lib/auth/auth-provider';
import { authApi } from '@/lib/auth/auth-api';
import { authenticatedDestination } from '@/lib/auth/auth-validation';

export default function EmailVerificationScreen() {
  const colors = useAppColors();
  const { verificationEmail, establishSession, clearVerification } = useAuth();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(0);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [cooldownUntil]);

  if (!verificationEmail) return <Redirect href="/(auth)/login" />;
  const remaining = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  const submit = async () => {
    if (pending) return;
    if (!/^\d{6}$/.test(code)) {
      setError('Enter all six digits from your email.');
      return;
    }
    setPending(true);
    setError('');
    setMessage('');
    controller.current?.abort();
    controller.current = new AbortController();
    try {
      const result = await authApi.verify(verificationEmail, code, controller.current.signal);
      setCode('');
      const profile = await establishSession(result.token, result.user);
      if (profile) router.replace(authenticatedDestination(profile.is_onboarded));
    } catch (requestError) {
      if (controller.current.signal.aborted) return;
      setCode('');
      setError(authApi.messageForError(requestError, 'We could not verify that code. Request a new one or try again.'));
    } finally {
      setPending(false);
    }
  };

  const resend = async () => {
    if (resending || pending || remaining > 0) return;
    setResending(true);
    setError('');
    setMessage('');
    setCode('');
    controller.current?.abort();
    controller.current = new AbortController();
    try {
      const responseMessage = await authApi.resend(verificationEmail, controller.current.signal);
      setMessage(`${responseMessage} If you requested another code, use the newest one; older codes may no longer work.`);
      setCooldownUntil(Date.now() + 30_000);
      setNow(Date.now());
    } catch (requestError) {
      if (controller.current.signal.aborted) return;
      setError(authApi.messageForError(requestError, 'We could not send a new code. Check your connection and try again.'));
    } finally {
      setResending(false);
    }
  };

  const backToLogin = () => {
    clearVerification();
    router.replace('/(auth)/login');
  };

  return (
    <AppScreen safeTop safeBottom>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl, gap: spacing.xxl }}>
          <View style={{ alignItems: 'center', gap: spacing.md }}>
            <View style={{ width: 72, height: 72, borderRadius: radius.lg, backgroundColor: colors.surfaceTint, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="mail-open-outline" size={32} color={colors.accentStrong} /></View>
            <AppText variant="display" align="center">Check your email.</AppText>
            <AppText variant="secondary" tone="secondary" align="center">Enter the six-digit code sent to</AppText>
            <AppText variant="cardTitle" align="center" selectable>{verificationEmail}</AppText>
          </View>

          <View style={{ gap: spacing.lg }}>
            {error ? <AppText accessibilityRole="alert" variant="secondary" tone="error">{error}</AppText> : null}
            {message ? <AppText accessibilityRole="text" variant="secondary" tone="success">{message}</AppText> : null}
            <View style={{ position: 'relative' }}>
              <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.xs }}>
                {Array.from({ length: 6 }, (_, index) => (
                  <View key={index} style={{ flex: 1, maxWidth: 48, height: 58, borderRadius: radius.md, borderCurve: 'continuous', borderWidth: 1, borderColor: error ? colors.error : index === code.length ? colors.accentStrong : colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                    <AppText variant="sectionTitle" style={{ fontVariant: ['tabular-nums'] }}>{code[index] ?? ''}</AppText>
                  </View>
                ))}
              </View>
              <TextInput
                accessibilityLabel="Six-digit verification code"
                accessibilityHint="Enter or paste the code from your email."
                keyboardType="number-pad"
                inputMode="numeric"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                maxLength={6}
                value={code}
                onChangeText={(value) => { setCode(value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                caretHidden
                style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 58, opacity: 0.02, color: 'transparent' }}
              />
            </View>
            <AppButton label="Verify email" loading={pending} disabled={pending || resending} onPress={() => void submit()} />
            <View style={{ alignItems: 'center', gap: spacing.xs }}>
              <AppText variant="secondary" tone="secondary" align="center">Codes expire after 10 minutes. The server checks the actual expiry.</AppText>
              <AppButton label={remaining ? `Send another code in ${remaining}s` : 'Resend code'} variant="quiet" loading={resending} disabled={pending || resending || remaining > 0} onPress={() => void resend()} />
            </View>
            <AppButton label="Back to sign in" variant="secondary" disabled={pending || resending} onPress={backToLogin} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}
