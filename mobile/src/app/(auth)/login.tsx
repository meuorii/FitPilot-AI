import { useEffect, useRef, useState } from 'react';
import { View, type TextInputInstance } from 'react-native';
import { router } from 'expo-router';
import { AuthFormScreen } from '@/components/layout/auth-form-screen';
import { AppTextField } from '@/components/ui/app-text-field';
import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { useAuth } from '@/lib/auth/auth-provider';
import { authApi } from '@/lib/auth/auth-api';
import { ApiError } from '@/lib/api/api-client';
import { authenticatedDestination, validateLogin } from '@/lib/auth/auth-validation';
import { spacing } from '@/theme';

export default function LoginScreen() {
  const { establishSession, beginVerification, startAuthentication, finishAuthentication, notice, clearNotice } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [requestError, setRequestError] = useState('');
  const [pending, setPending] = useState(false);
  const passwordField = useRef<TextInputInstance | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const submit = async () => {
    if (pending) return;
    const validation = validateLogin(email, password);
    const normalizedEmail = validation.email;
    setEmailError(validation.errors.email);
    setPasswordError(validation.errors.password);
    setRequestError('');
    if (validation.errors.email || validation.errors.password) return;

    setPending(true);
    startAuthentication();
    controller.current?.abort();
    controller.current = new AbortController();
    try {
      const result = await authApi.login(normalizedEmail, password, controller.current.signal);
      const profile = await establishSession(result.token, result.user);
      if (profile) router.replace(authenticatedDestination(profile.is_onboarded));
    } catch (error) {
      if (controller.current.signal.aborted) return;
      if (error instanceof ApiError && error.code === 'EMAIL_NOT_VERIFIED') {
        beginVerification(normalizedEmail);
        router.replace('/(verification)/email');
      } else if (error instanceof ApiError) {
        setRequestError(authApi.messageForError(error, 'We could not sign you in. Try again.'));
      } else {
        setRequestError('FitPilot could not save your sign-in securely. Check device security settings and try again.');
      }
    } finally {
      finishAuthentication();
      setPending(false);
    }
  };

  return (
    <AuthFormScreen mascot="login">
      <View style={{ alignItems: 'flex-start', gap: spacing.xs }}>
        <View><AppText variant="display">Welcome back.</AppText></View>
        <View><AppText variant="secondary" tone="secondary">Every step counts. Pick up where you left off.</AppText></View>
      </View>

      <View style={{ gap: spacing.lg }}>
        {notice ? <AppText accessibilityRole="alert" variant="secondary" tone="secondary">{notice}</AppText> : null}
        {requestError ? <AppText accessibilityRole="alert" variant="secondary" tone="error">{requestError}</AppText> : null}
        <View><AppTextField label="Email" value={email} onChangeText={(value) => { setEmail(value); setEmailError(''); clearNotice(); }} error={emailError} placeholder="you@example.com" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" autoComplete="email" returnKeyType="next" onSubmitEditing={() => passwordField.current?.focus()} importantForAutofill="yes" /></View>
        <View><AppTextField ref={passwordField} label="Password" value={password} onChangeText={(value) => { setPassword(value); setPasswordError(''); }} error={passwordError} secure autoCapitalize="none" autoCorrect={false} textContentType="password" autoComplete="current-password" returnKeyType="go" onSubmitEditing={() => void submit()} /></View>
        <View><AppButton label="Sign in" loading={pending} disabled={pending} onPress={() => void submit()} /></View>
        <AppText variant="caption" tone="secondary" align="center">Password reset is not available yet.</AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: spacing.xs }}>
          <AppText variant="secondary" tone="secondary">New to FitPilot?</AppText>
          <AppButton label="Create account" variant="quiet" onPress={() => router.push('/(auth)/register')} />
        </View>
      </View>
    </AuthFormScreen>
  );
}
