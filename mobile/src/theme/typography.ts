import type { TextStyle } from 'react-native';

export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '700' as const, letterSpacing: -0.8 },
  pageTitle: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const, letterSpacing: -0.5 },
  sectionTitle: { fontSize: 20, lineHeight: 26, fontWeight: '600' as const },
  cardTitle: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  secondary: { fontSize: 14, lineHeight: 21, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 17, fontWeight: '500' as const },
  button: { fontSize: 15, lineHeight: 20, fontWeight: '600' as const },
  metric: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const, fontVariant: ['tabular-nums'] as const },
} satisfies Record<string, TextStyle>;
