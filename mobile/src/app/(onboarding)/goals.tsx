import { OnboardingPreviewStep } from '@/components/layout/onboarding-preview-step';

export default function OnboardingGoalsPreview() {
  return <OnboardingPreviewStep title="Your goals" description="Goal selection and server-calculated plans will be implemented against verified API contracts in Phase 3." previous next="/(onboarding)/plan-summary" nextLabel="Continue to Plan" />;
}
