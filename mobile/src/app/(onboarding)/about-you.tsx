import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppScreen } from '@/components/layout/app-screen';
import { AppText } from '@/components/ui/app-text';
import { AppTextField } from '@/components/ui/app-text-field';
import { AppButton } from '@/components/ui/app-button';
import { OnboardingProgress } from '@/components/layout/onboarding-progress';
import { Entrance } from '@/components/motion/entrance';
import { useAuth } from '@/lib/auth/auth-provider';
import { authApi } from '@/lib/auth/auth-api';
import type { ActivityLevel, CalculateGoalsRequest } from '@/lib/auth/auth-types';
import { validateAboutYou, onboardingBaselineKey } from '@/lib/auth/auth-validation';
import { useOnboardingDraft } from '@/lib/onboarding/onboarding-draft';
import { useAppColors, radius, spacing } from '@/theme';
import { RoccoImage } from '@/components/mascot/rocco-image';

const activityOptions: { value: ActivityLevel; label: string; description: string; frequency: string; image: 'activitySedentary' | 'activityLightlyActive' | 'activityModeratelyActive' | 'activityVeryActive' }[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Mostly seated, with little planned exercise.', frequency: '0–1 sessions a week', image: 'activitySedentary' },
  { value: 'lightly_active', label: 'Lightly active', description: 'Regular movement and a few easy sessions.', frequency: '1–3 sessions a week', image: 'activityLightlyActive' },
  { value: 'moderately_active', label: 'Moderately active', description: 'Consistent exercise across most weeks.', frequency: '3–5 sessions a week', image: 'activityModeratelyActive' },
  { value: 'very_active', label: 'Very active', description: 'Frequent training or a physical daily routine.', frequency: '6–7 sessions a week', image: 'activityVeryActive' },
];

export default function AboutYouScreen() {
  const colors = useAppColors();
  const queryClient = useQueryClient();
  const { aboutYou, goalOptions, calculatedFor, updateAboutYou, saveGoalOptions } = useOnboardingDraft();
  const { status, profile } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calculationNotice, setCalculationNotice] = useState('');
  const controller = useRef<AbortController | null>(null);
  const mutation = useMutation({ mutationFn: (input: CalculateGoalsRequest) => authApi.calculateGoals(input, controller.current?.signal) });

  useEffect(() => () => controller.current?.abort(), []);

  if (status === 'signedInSummary') return <Redirect href="/(onboarding)/plan-summary" />;
  if (status !== 'signedInOnboarding' && !profile) return null;

  const validate = () => {
    const validation = validateAboutYou(aboutYou);
    setErrors(validation.errors);
    return validation.payload;
  };

  const continueToGoals = async () => {
    const payload = validate();
    if (!payload || mutation.isPending) return;
    const baseline = onboardingBaselineKey(aboutYou);
    if (calculatedFor === baseline && goalOptions.length > 0) {
      router.push('/(onboarding)/goals');
      return;
    }
    controller.current?.abort();
    controller.current = new AbortController();
    try {
      const options = await mutation.mutateAsync(payload);
      if (options.length === 0) {
        setCalculationNotice('FitPilot did not return any goal options. Your details are still here; retry the calculation.');
        return;
      }
      setCalculationNotice('');
      saveGoalOptions(options, baseline);
      queryClient.setQueryData(['fitpilot', 'onboarding', 'goals', baseline], options);
      router.push('/(onboarding)/goals');
    } catch {
      // Keep the entered values and the screen in place so the user can retry.
    }
  };

  const apiError = mutation.error ? authApi.messageForError(mutation.error, 'We could not calculate your goals. Try again.') : calculationNotice;

  return (
    <AppScreen safeTop safeBottom>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.xl }}>
          <Entrance><OnboardingProgress step={2} /></Entrance>
          <Entrance delay={45} style={{ gap: spacing.xs }}>
            <AppText variant="display">About you</AppText>
            <AppText variant="secondary" tone="secondary">These basics help us calculate a starting plan for you.</AppText>
          </Entrance>

          <Entrance delay={75} style={{ gap: spacing.md }}>
            <AppTextField label="Age" value={aboutYou.age} onChangeText={(value) => { updateAboutYou('age', value.replace(/[^\d]/g, '').slice(0, 3)); setErrors((old) => ({ ...old, age: '' })); }} error={errors.age} placeholder="Years" keyboardType="number-pad" maxLength={3} returnKeyType="next" />
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <Pressable accessibilityRole="radio" accessibilityState={{ selected: aboutYou.gender === 'female' }} onPress={() => { updateAboutYou('gender', 'female'); setErrors((old) => ({ ...old, gender: '' })); }} style={({ pressed }) => ({ flex: 1, minHeight: 50, padding: spacing.md, justifyContent: 'center', borderWidth: 1, borderRadius: radius.md, borderCurve: 'continuous', borderColor: aboutYou.gender === 'female' ? colors.accentStrong : colors.border, backgroundColor: aboutYou.gender === 'female' ? colors.surfaceTint : colors.surface, opacity: pressed ? 0.8 : 1 })}>
                <AppText variant="button">Female</AppText>
              </Pressable>
              <Pressable accessibilityRole="radio" accessibilityState={{ selected: aboutYou.gender === 'male' }} onPress={() => { updateAboutYou('gender', 'male'); setErrors((old) => ({ ...old, gender: '' })); }} style={({ pressed }) => ({ flex: 1, minHeight: 50, padding: spacing.md, justifyContent: 'center', borderWidth: 1, borderRadius: radius.md, borderCurve: 'continuous', borderColor: aboutYou.gender === 'male' ? colors.accentStrong : colors.border, backgroundColor: aboutYou.gender === 'male' ? colors.surfaceTint : colors.surface, opacity: pressed ? 0.8 : 1 })}>
                <AppText variant="button">Male</AppText>
              </Pressable>
            </View>
            {errors.gender ? <AppText variant="caption" tone="error">{errors.gender}</AppText> : null}
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={{ flex: 1 }}><AppTextField label="Height (cm)" value={aboutYou.height_cm} onChangeText={(value) => { updateAboutYou('height_cm', value.replace(/[^\d.]/g, '').slice(0, 6)); setErrors((old) => ({ ...old, height_cm: '' })); }} error={errors.height_cm} placeholder="170" keyboardType="decimal-pad" maxLength={6} /></View>
              <View style={{ flex: 1 }}><AppTextField label="Current weight (kg)" value={aboutYou.weight_kg} onChangeText={(value) => { updateAboutYou('weight_kg', value.replace(/[^\d.]/g, '').slice(0, 6)); setErrors((old) => ({ ...old, weight_kg: '' })); }} error={errors.weight_kg} placeholder="70" keyboardType="decimal-pad" maxLength={6} /></View>
            </View>
          </Entrance>

          <Entrance delay={105} style={{ gap: spacing.md }}>
            <View style={{ gap: spacing.xs }}><AppText variant="cardTitle">How active are you?</AppText><AppText variant="caption" tone="secondary">Choose what describes a typical week, not your best week.</AppText></View>
            <View accessibilityRole="radiogroup" accessibilityLabel="Weekly activity level" style={{ gap: spacing.sm }}>
            {activityOptions.map((option) => {
              const selected = aboutYou.activity_level === option.value;
              return (
                <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={`${option.label}. ${option.description} ${option.frequency}`} accessibilityState={{ selected }} onPress={() => { void Haptics.selectionAsync().catch(() => undefined); updateAboutYou('activity_level', option.value); setErrors((old) => ({ ...old, activity_level: '' })); }} style={({ pressed }) => ({ minHeight: 104, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderCurve: 'continuous', borderWidth: 1, borderColor: selected ? colors.accentStrong : colors.border, backgroundColor: selected ? colors.surfaceTint : colors.surface, opacity: pressed ? 0.82 : 1 })}>
                  <View style={{ backgroundColor: selected ? colors.background : colors.surfaceTint, borderRadius: radius.sm, padding: spacing.xxs }}>
                    <RoccoImage variant={option.image} width={54} height={68} decorative />
                  </View>
                  <View style={{ flex: 1, gap: spacing.xxs }}><AppText variant="cardTitle">{option.label}</AppText><AppText variant="caption" tone="secondary">{option.description}</AppText><AppText variant="caption" tone="accent">{option.frequency}</AppText></View>
                  <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: 22, height: 22, borderWidth: 2, borderColor: selected ? colors.accentStrong : colors.border, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' }}>{selected ? <View style={{ width: 10, height: 10, borderRadius: radius.pill, backgroundColor: colors.accentStrong }} /> : null}</View>
                </Pressable>
              );
            })}
            </View>
            {errors.activity_level ? <AppText variant="caption" tone="error">{errors.activity_level}</AppText> : null}
          </Entrance>

          {apiError ? <AppText accessibilityRole="alert" variant="secondary" tone="error">{apiError}</AppText> : null}
          <Entrance delay={135} style={{ gap: spacing.sm }}>
          <AppButton label={mutation.error || calculationNotice ? 'Retry calculation' : 'Continue'} loading={mutation.isPending} disabled={mutation.isPending} onPress={() => void continueToGoals()} />
            <AppButton label="Previous" variant="quiet" disabled={mutation.isPending} onPress={() => router.replace('/(onboarding)/welcome')} />
          </Entrance>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}
