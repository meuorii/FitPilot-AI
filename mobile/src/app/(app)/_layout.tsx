import { Stack } from 'expo-router';
import { useAppColors } from '@/theme';

export default function AppLayout() {
  const colors = useAppColors();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="settings/index" options={{ headerShown: true, title: 'Settings', headerBackTitle: 'Back', headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text, headerTitleStyle: { color: colors.text } }} />
    </Stack>
  );
}
