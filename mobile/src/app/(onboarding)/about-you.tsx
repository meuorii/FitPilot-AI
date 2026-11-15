import { OnboardingPreviewStep } from '@/components/layout/onboarding-preview-step';

export default function OnboardingAboutYouPreview() {
  return <OnboardingPreviewStep title="About you" description="Personal information inputs and validation are reserved for Phase 3." previous next="/(onboarding)/goals" nextLabel="Continue to Goals" />;
}
