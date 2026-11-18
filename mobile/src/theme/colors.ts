export const palette = {
  light: {
    background: '#F5F3F6',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    surfaceTint: '#DCD6DE',
    text: '#38323F',
    textSecondary: '#595460',
    textMuted: '#595460',
    accent: '#7482A4',
    accentStrong: '#596783',
    accentPressed: '#4C5873',
    onAccent: '#FFFFFF',
    border: '#E2DFE7',
    divider: '#ECEAF1',
    success: '#287454',
    warning: '#8A5A12',
    error: '#A63F4A',
    disabled: '#AAA6B0',
    skeleton: '#E7E4EB',
    focus: '#344F85',
  },
} as const;

export type AppColors = { [Key in keyof (typeof palette)['light']]: string };

export function useAppColors(): AppColors {
  return palette.light;
}
