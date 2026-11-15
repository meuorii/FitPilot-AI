import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '@/components/layout/app-screen';
import { AppText } from '@/components/ui/app-text';
import { AppButton } from '@/components/ui/app-button';
import { spacing } from '@/theme';

export default function EmailVerificationPlaceholderScreen() {
  return <AppScreen safeTop><ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.xl }}><View style={{ gap: spacing.md }}><AppText variant="pageTitle">Email verification</AppText><AppText variant="secondary" tone="secondary">The native verification flow will use the existing FitPilot API in Phase 3. No code is sent or accepted in this preview.</AppText><AppButton label="Back to sign in" variant="secondary" onPress={() => router.replace('/(auth)/login')} /></View></ScrollView></AppScreen>;
}
