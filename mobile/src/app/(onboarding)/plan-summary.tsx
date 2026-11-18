import { Redirect, router, Stack } from 'expo-router';
import { BackHandler, ScrollView, View } from 'react-native';
import { useEffect } from 'react';
import { AppScreen } from '@/components/layout/app-screen';
import { AppText } from '@/components/ui/app-text';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { RoccoImage } from '@/components/mascot/rocco-image';
import { OnboardingProgress } from '@/components/layout/onboarding-progress';
import { Entrance } from '@/components/motion/entrance';
import { useAuth } from '@/lib/auth/auth-provider';
import { useOnboardingDraft } from '@/lib/onboarding/onboarding-draft';
import { spacing } from '@/theme';
import type { PrimaryGoal } from '@/lib/auth/auth-types';

const goalLabels: Record<PrimaryGoal, string> = {
  lose_weight: 'Lose weight', lose_fat: 'Lose body fat', maintain: 'Maintain weight', gain_muscle: 'Gain muscle',
};
const number = (value: number) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);

export default function PlanSummaryScreen() {
  const { profile, finishOnboarding } = useAuth();
  const { savedProfile } = useOnboardingDraft();
  const completedProfile = savedProfile ?? profile;
  useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => listener.remove();
  }, []);
  if (!completedProfile?.is_onboarded) return <Redirect href="/(onboarding)/welcome" />;
  const completedGoal = completedProfile.primary_goal ? goalLabels[completedProfile.primary_goal] : null;

  const metrics: { label: string; value: string }[] = [];
  if (typeof completedProfile.current_weight_kg === 'number' && Number.isFinite(completedProfile.current_weight_kg)) metrics.push({ label: 'Starting weight', value: `${completedProfile.current_weight_kg} kg` });
  if (typeof completedProfile.target_weight_kg === 'number' && Number.isFinite(completedProfile.target_weight_kg)) metrics.push({ label: 'Target weight', value: `${completedProfile.target_weight_kg} kg` });
  if (typeof completedProfile.daily_calories === 'number' && Number.isFinite(completedProfile.daily_calories)) metrics.push({ label: 'Daily calories', value: `${number(completedProfile.daily_calories)} kcal` });
  if (typeof completedProfile.protein_grams === 'number' && Number.isFinite(completedProfile.protein_grams)) metrics.push({ label: 'Protein', value: `${number(completedProfile.protein_grams)} g` });
  if (typeof completedProfile.carbs_grams === 'number' && Number.isFinite(completedProfile.carbs_grams)) metrics.push({ label: 'Carbohydrates', value: `${number(completedProfile.carbs_grams)} g` });
  if (typeof completedProfile.fat_grams === 'number' && Number.isFinite(completedProfile.fat_grams)) metrics.push({ label: 'Fat', value: `${number(completedProfile.fat_grams)} g` });

  const enterDashboard = () => {
    finishOnboarding();
    router.replace('/(app)/(tabs)');
  };

  return (
    <AppScreen safeTop safeBottom>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, padding: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.xl }}>
        <Entrance><OnboardingProgress step={4} /></Entrance>
        <Entrance delay={55} style={{ alignItems: 'center', gap: spacing.sm }}>
          <RoccoImage variant="planSummary" width={144} height={180} decorative />
          <AppText variant="display" align="center">Your plan is ready.</AppText>
          <AppText variant="secondary" tone="secondary" align="center">Your starting goals are set. Let’s make every session count.</AppText>
        </Entrance>
        <Entrance delay={95}><AppCard inset="lg" tint>
          <View style={{ gap: spacing.lg }}>
            {completedGoal ? <View style={{ gap: spacing.xs }}><AppText variant="caption" tone="secondary">Your goal</AppText><AppText variant="sectionTitle">{completedGoal}</AppText></View> : null}
            {metrics.length > 0 ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
              {metrics.map((metric) => <View key={metric.label} style={{ width: '46%', minHeight: 68, justifyContent: 'center', gap: spacing.xxs }}><AppText variant="caption" tone="secondary">{metric.label}</AppText><AppText variant="cardTitle">{metric.value}</AppText></View>)}
            </View> : <AppText variant="secondary" tone="secondary">Your profile is saved. Nutrition targets will appear when FitPilot provides them.</AppText>}
          </View>
        </AppCard></Entrance>
        <Entrance delay={135}><AppButton label="Go to Dashboard" onPress={enterDashboard} /></Entrance>
      </ScrollView>
    </AppScreen>
  );
}
