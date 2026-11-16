import { Stack } from 'expo-router';
import { useAppColors } from '@/theme';

export default function AuthLayout() {
  const colors = useAppColors();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
