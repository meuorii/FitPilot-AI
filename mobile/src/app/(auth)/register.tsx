import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, type TextInputInstance } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '@/components/layout/app-screen';
import { AppTextField } from '@/components/ui/app-text-field';
import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { RoccoImage } from '@/components/mascot/rocco-image';
import { Entrance } from '@/components/motion/entrance';
import { useAuth } from '@/lib/auth/auth-provider';
import { authApi } from '@/lib/auth/auth-api';
import { ApiError } from '@/lib/api/api-client';
import { validateRegistration } from '@/lib/auth/auth-validation';
import { spacing } from '@/theme';

export default function RegisterScreen() {
  const { beginVerification, startAuthentication, finishAuthentication } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requestError, setRequestError] = useState('');
  const [pending, setPending] = useState(false);
  const emailField = useRef<TextInputInstance | null>(null);
  const passwordField = useRef<TextInputInstance | null>(null);
  const confirmationField = useRef<TextInputInstance | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const submit = async () => {
    if (pending) return;
    const validation = validateRegistration(fullName, email, password, confirmation);
    const normalizedName = validation.fullName;
    const normalizedEmail = validation.email;
    const nextErrors = validation.errors;
    setErrors(nextErrors);
    setRequestError('');
    if (Object.values(nextErrors).some(Boolean)) return;

    setPending(true);
    startAuthentication();
    controller.current?.abort();
    controller.current = new AbortController();
    try {
      const result = await authApi.register(normalizedName, normalizedEmail, password, controller.current.signal);
      beginVerification(result.email);
      router.replace('/(verification)/email');
    } catch (error) {
      if (controller.current.signal.aborted) return;
      if (error instanceof ApiError && error.code === 'EMAIL_NOT_VERIFIED') {
        beginVerification(normalizedEmail);
        router.replace('/(verification)/email');
      } else if (error instanceof ApiError) {
        setRequestError(authApi.messageForError(error, 'We could not create your account. Your details are still here; try again.'));
      } else {
        setRequestError('We could not create your account. Check your connection and try again. Your details are still here.');
      }
    } finally {
      finishAuthentication();
      setPending(false);
    }
  };

  return (
    <AppScreen safeTop safeBottom>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl, gap: spacing.xxl }}>
          <View style={{ alignItems: 'center', gap: spacing.sm }}>
            <Entrance><RoccoImage variant="workout" width={82} height={92} decorative /></Entrance>
            <Entrance delay={55}><AppText variant="display" align="center">Start with your name.</AppText></Entrance>
            <Entrance delay={100}><AppText variant="secondary" tone="secondary" align="center">Create an account and we’ll build a plan around you.</AppText></Entrance>
          </View>
          <View style={{ gap: spacing.lg }}>
            {requestError ? <AppText accessibilityRole="alert" variant="secondary" tone="error">{requestError}</AppText> : null}
            <Entrance delay={120}><AppTextField label="Full name" value={fullName} onChangeText={(value) => { setFullName(value); setErrors((old) => ({ ...old, fullName: '' })); }} error={errors.fullName} placeholder="Your name" autoCapitalize="words" autoCorrect={false} textContentType="name" autoComplete="name" returnKeyType="next" onSubmitEditing={() => emailField.current?.focus()} /></Entrance>
            <Entrance delay={155}><AppTextField ref={emailField} label="Email" value={email} onChangeText={(value) => { setEmail(value); setErrors((old) => ({ ...old, email: '' })); }} error={errors.email} placeholder="you@example.com" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" autoComplete="email" returnKeyType="next" onSubmitEditing={() => passwordField.current?.focus()} /></Entrance>
            <Entrance delay={190}><AppTextField ref={passwordField} label="Password" value={password} onChangeText={(value) => { setPassword(value); setErrors((old) => ({ ...old, password: '', confirmation: '' })); }} error={errors.password} hint="At least 8 characters." secure autoCapitalize="none" autoCorrect={false} textContentType="newPassword" autoComplete="new-password" returnKeyType="next" onSubmitEditing={() => confirmationField.current?.focus()} /></Entrance>
            <Entrance delay={225}><AppTextField ref={confirmationField} label="Confirm password" value={confirmation} onChangeText={(value) => { setConfirmation(value); setErrors((old) => ({ ...old, confirmation: '' })); }} error={errors.confirmation} secure autoCapitalize="none" autoCorrect={false} textContentType="newPassword" autoComplete="new-password" returnKeyType="go" onSubmitEditing={() => void submit()} /></Entrance>
            <Entrance delay={260}><AppButton label="Create account" loading={pending} disabled={pending} onPress={() => void submit()} /></Entrance>
            <Entrance delay={295} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: spacing.xs }}>
              <AppText variant="secondary" tone="secondary">Already have an account?</AppText>
              <AppButton label="Sign in" variant="quiet" onPress={() => router.replace('/(auth)/login')} />
            </Entrance>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}
