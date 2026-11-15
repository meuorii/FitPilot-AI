import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppScreen } from '@/components/layout/app-screen';
import { AppText } from '@/components/ui/app-text';
import { AppButton } from '@/components/ui/app-button';
import { OnboardingProgress } from '@/components/layout/onboarding-progress';
import { authApi } from '@/lib/auth/auth-api';
import { useAuth } from '@/lib/auth/auth-provider';
import type { CompleteOnboardingRequest, PrimaryGoal } from '@/lib/auth/auth-types';
import { onboardingBaselineKey } from '@/lib/auth/auth-validation';
import { useOnboardingDraft } from '@/lib/onboarding/onboarding-draft';
import { useAppColors, radius, spacing } from '@/theme';

const goalDescriptions: Record<PrimaryGoal, string> = {
  lose_weight: 'Work toward a lower body weight with a steady calorie deficit.',
  lose_fat: 'Reduce body fat while supporting strength and lean mass.',
  maintain: 'Keep your weight steady and build consistent habits.',
  gain_muscle: 'Support muscle growth with a controlled calorie surplus.',
};
const formatNumber = (value: number, decimals = 0) => new Intl.NumberFormat(undefined, { maximumFractionDigits: decimals }).format(value);

export default function OnboardingGoalsScreen() {
  const colors = useAppColors();
  const queryClient = useQueryClient();
  const { aboutYou, goalOptions, selectedGoal, calculatedFor, selectGoal, saveProfile } = useOnboardingDraft();
  const { status, updateProfile } = useAuth();
  const [validationError, setValidationError] = useState('');
  const controller = useRef<AbortController | null>(null);
  const currentKey = onboardingBaselineKey(aboutYou);
  const mutation = useMutation({
    mutationFn: (payload: CompleteOnboardingRequest) => authApi.saveOnboarding(payload, controller.current?.signal),
    onSuccess: async (savedProfile) => {
      saveProfile(savedProfile);
      updateProfile(savedProfile, true);
      queryClient.setQueryData(['fitpilot', 'profile', savedProfile.id], savedProfile);
      await queryClient.invalidateQueries({ queryKey: ['fitpilot', 'session'] });
    },
  });

  useEffect(() => () => controller.current?.abort(), []);
  const validGoals = goalOptions.length > 0 && calculatedFor === currentKey;
  if (status === 'signedInSummary') return <Redirect href="/(onboarding)/plan-summary" />;
  if (!validGoals) return <Redirect href="/(onboarding)/about-you" />;

  const saveAndContinue = async () => {
    if (!selectedGoal || mutation.isPending || !aboutYou.gender || !aboutYou.activity_level) return;
    const age = Number(aboutYou.age);
    const height = Number(aboutYou.height_cm);
    const currentWeight = Number(aboutYou.weight_kg);
    const targetWeight = selectedGoal.recommended_target_weight_kg;
    if (![age, height, currentWeight, targetWeight].every(Number.isFinite) || targetWeight <= 0) {
      setValidationError('The selected goal did not include a valid target weight. Go back and recalculate your options.');
      return;
    }
    setValidationError('');
    const payload: CompleteOnboardingRequest = {
      age,
      gender: aboutYou.gender,
      height_cm: height,
      current_weight_kg: currentWeight,
      target_weight_kg: targetWeight,
      activity_level: aboutYou.activity_level,
      primary_goal: selectedGoal.goal,
      is_onboarded: true,
    };
    controller.current?.abort();
    controller.current = new AbortController();
    try {
      await mutation.mutateAsync(payload);
      router.replace('/(onboarding)/plan-summary');
    } catch {
      // Keep the selected goal and show the inline retry state.
    }
  };

  const errorMessage = mutation.error ? authApi.messageForError(mutation.error, 'We could not save your plan. Your selection is still here; try again.') : '';

  return (
    <AppScreen safeTop safeBottom>
      <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.xl }}>
        <OnboardingProgress step={3} />
        <View style={{ gap: spacing.xs }}>
          <AppText variant="display">Choose your direction.</AppText>
          <AppText variant="secondary" tone="secondary">Pick the goal that feels right. Targets below come from your FitPilot calculation.</AppText>
        </View>
        <View accessibilityRole="radiogroup" accessibilityLabel="Primary fitness goal" style={{ gap: spacing.md }}>
          {goalOptions.map((goal) => {
            const selected = goal.goal === selectedGoal?.goal;
            return (
              <Pressable key={goal.goal} accessibilityRole="radio" accessibilityLabel={`${goal.label}${goal.is_recommended ? ', recommended' : ''}`} accessibilityState={{ selected }} disabled={mutation.isPending} onPress={() => selectGoal(goal)} style={({ pressed }) => ({ padding: spacing.lg, gap: spacing.md, borderRadius: radius.lg, borderCurve: 'continuous', borderWidth: selected ? 2 : 1, borderColor: selected ? colors.accentStrong : colors.border, backgroundColor: selected ? colors.surfaceTint : colors.surface, opacity: pressed ? 0.85 : 1 })}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm }}>
                  <View style={{ flex: 1, gap: spacing.xs }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs }}>
                      <AppText variant="cardTitle">{goal.label}</AppText>
                      {goal.is_recommended ? <View style={{ paddingHorizontal: spacing.xs, paddingVertical: spacing.xxs, borderRadius: radius.sm, backgroundColor: colors.surface }}><AppText variant="caption" tone="accent">Recommended</AppText></View> : null}
                    </View>
                    <AppText variant="caption" tone="secondary">{goalDescriptions[goal.goal]}</AppText>
                    {goal.is_recommended && goal.recommendation_reason ? <AppText variant="caption" tone="secondary">{goal.recommendation_reason}</AppText> : null}
                  </View>
                  <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: 24, height: 24, borderWidth: 2, borderColor: selected ? colors.accentStrong : colors.border, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' }}>{selected ? <View style={{ width: 12, height: 12, borderRadius: radius.pill, backgroundColor: colors.accentStrong }} /> : null}</View>
                </View>
                <View style={{ borderTopWidth: 1, borderColor: colors.border, paddingTop: spacing.md, gap: spacing.sm }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xs }}>
                    <Metric label="Calories" value={`${formatNumber(goal.metrics.daily_calories)} kcal`} colors={colors} />
                    <Metric label="Target weight" value={`${formatNumber(goal.recommended_target_weight_kg, 1)} kg`} colors={colors} />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xs }}>
                    <Metric label="Protein" value={`${formatNumber(goal.metrics.protein_grams)} g`} colors={colors} />
                    <Metric label="Carbs" value={`${formatNumber(goal.metrics.carbs_grams)} g`} colors={colors} />
                    <Metric label="Fat" value={`${formatNumber(goal.metrics.fat_grams)} g`} colors={colors} />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
        {errorMessage || validationError ? <AppText accessibilityRole="alert" variant="secondary" tone="error">{validationError || errorMessage}</AppText> : null}
        <View style={{ gap: spacing.sm }}>
          <AppButton label={mutation.error ? 'Retry saving plan' : 'Save my plan'} loading={mutation.isPending} disabled={!selectedGoal || mutation.isPending} onPress={() => void saveAndContinue()} />
          <AppButton label="Previous" variant="quiet" disabled={mutation.isPending} onPress={() => router.replace('/(onboarding)/about-you')} />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

function Metric({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useAppColors> }) {
  return <View style={{ flex: 1, gap: spacing.xxs }}><AppText variant="caption" tone="secondary">{label}</AppText><AppText variant="caption" style={{ color: colors.text, fontWeight: '700' }}>{value}</AppText></View>;
}
