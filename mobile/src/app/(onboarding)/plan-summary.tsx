import { OnboardingPreviewStep } from '@/components/layout/onboarding-preview-step';

export default function OnboardingPlanPreview() {
  return <OnboardingPreviewStep title="Plan summary" description="This placeholder confirms the final route and back behavior. No plan is generated or saved." previous next="/(app)/(tabs)" nextLabel="Return to preview shell" />;
}
