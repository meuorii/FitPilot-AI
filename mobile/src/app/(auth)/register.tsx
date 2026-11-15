import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '@/components/layout/app-screen';
import { AppText } from '@/components/ui/app-text';
import { AppButton } from '@/components/ui/app-button';
import { AppBadge } from '@/components/ui/app-badge';
import { spacing } from '@/theme';

export default function RegistrationPlaceholderScreen() {
  return (
    <AppScreen safeTop>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.xl }}>
        <View style={{ gap: spacing.md }}><AppBadge label="PHASE 3 PREVIEW" /><AppText variant="display">Create your FitPilot account.</AppText><AppText variant="secondary" tone="secondary">Registration and email verification will connect to the existing API in Phase 3.</AppText></View>
        <AppButton label="Back to sign in" variant="secondary" onPress={() => router.back()} />
      </ScrollView>
    </AppScreen>
  );
}
