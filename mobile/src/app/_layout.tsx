import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '@/lib/providers/app-providers';
import { useAppColors } from '@/theme';
import { useAuth } from '@/lib/auth/auth-provider';

function AppStack() {
  const colors = useAppColors();
  const { status } = useAuth();
  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Protected guard={status === 'signedOut' || status === 'sessionExpired' || status === 'authenticating'}><Stack.Screen name="(auth)" /></Stack.Protected>
        <Stack.Protected guard={status === 'verificationPending'}><Stack.Screen name="(verification)" /></Stack.Protected>
        <Stack.Protected guard={status === 'signedInOnboarding' || status === 'signedInSummary'}><Stack.Screen name="(onboarding)" /></Stack.Protected>
        <Stack.Protected guard={status === 'signedInReady'}><Stack.Screen name="(app)" /></Stack.Protected>
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  return <AppProviders><AppStack /></AppProviders>;
}
