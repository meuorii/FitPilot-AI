import { View } from 'react-native';
import { AppText } from './app-text';
import { spacing } from '@/theme';

export function AppSectionHeader({ title, detail }: { title: string; detail?: string }) {
  return <View style={{ gap: spacing.xxs }}><AppText variant="sectionTitle">{title}</AppText>{detail ? <AppText variant="secondary" tone="secondary">{detail}</AppText> : null}</View>;
}
