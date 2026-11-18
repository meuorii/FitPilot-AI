import { Tabs, router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppIconButton } from '@/components/ui/app-icon-button';
import { useAppColors, typography } from '@/theme';

const tabIcons = {
  index: ['home-outline', 'home'] as const,
  workouts: ['barbell-outline', 'barbell'] as const,
  meals: ['restaurant-outline', 'restaurant'] as const,
  progress: ['stats-chart-outline', 'stats-chart'] as const,
  coach: ['chatbubble-ellipses-outline', 'chatbubble-ellipses'] as const,
};

export default function TabLayout() {
  const colors = useAppColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: 'FitPilot',
        headerTitleStyle: { color: colors.text, fontSize: 18, fontWeight: '700' },
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerRight: () => <AppIconButton icon="person-circle-outline" label="Open settings" onPress={() => router.push('/(app)/settings')} style={{ marginRight: 6 }} />,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, paddingTop: 6 },
        tabBarLabelStyle: { ...typography.caption, fontSize: 11, marginBottom: 2 },
        tabBarIconStyle: { marginTop: 1 },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarAccessibilityLabel: 'Home tab', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? tabIcons.index[1] : tabIcons.index[0]} size={21} color={typeof color === 'string' ? color : colors.accentStrong} /> }} />
      <Tabs.Screen name="workouts" options={{ title: 'Workouts', tabBarAccessibilityLabel: 'Workouts tab', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? tabIcons.workouts[1] : tabIcons.workouts[0]} size={21} color={typeof color === 'string' ? color : colors.accentStrong} /> }} />
      <Tabs.Screen name="meals" options={{ title: 'Meals', tabBarAccessibilityLabel: 'Meals tab', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? tabIcons.meals[1] : tabIcons.meals[0]} size={21} color={typeof color === 'string' ? color : colors.accentStrong} /> }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarAccessibilityLabel: 'Progress tab', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? tabIcons.progress[1] : tabIcons.progress[0]} size={21} color={typeof color === 'string' ? color : colors.accentStrong} /> }} />
      <Tabs.Screen name="coach" options={{ title: 'AI Coach', tabBarAccessibilityLabel: 'AI Coach tab', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? tabIcons.coach[1] : tabIcons.coach[0]} size={21} color={typeof color === 'string' ? color : colors.accentStrong} /> }} />
    </Tabs>
  );
}
