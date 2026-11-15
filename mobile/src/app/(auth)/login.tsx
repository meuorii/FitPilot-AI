import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '@/components/layout/app-screen';
import { RoccoImage } from '@/components/mascot/rocco-image';
import { AppText } from '@/components/ui/app-text';
import { AppButton } from '@/components/ui/app-button';
import { AppBadge } from '@/components/ui/app-badge';
import { spacing } from '@/theme';

export default function LoginPlaceholderScreen() {
  return (
    <AppScreen safeTop>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.xl }}>
        <View style={{ alignItems: 'center', gap: spacing.md }}>
          <RoccoImage variant="coachAvatar" width={116} height={116} decorative />
          <AppText variant="display" align="center">Welcome back.</AppText>
          <AppText variant="secondary" tone="secondary" align="center">Native sign-in and account recovery are planned for Phase 3.</AppText>
          <AppBadge label="AUTHENTICATION PREVIEW" />
        </View>
        <View style={{ gap: spacing.sm }}>
          <AppButton label="Registration placeholder" onPress={() => router.push('/(auth)/register')} />
          {__DEV__ ? <AppButton label="Open development shell" variant="secondary" onPress={() => router.replace('/(app)/(tabs)')} /> : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
}
