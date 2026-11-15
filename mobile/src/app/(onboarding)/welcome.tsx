import { OnboardingPreviewStep } from '@/components/layout/onboarding-preview-step';

export default function OnboardingWelcomePreview() {
  return <OnboardingPreviewStep title="Welcome to FitPilot." description="Your onboarding flow will start here after authentication is connected." next="/(onboarding)/about-you" nextLabel="Continue to About You" />;
}
