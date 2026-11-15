import { useColorScheme } from 'react-native';

export const palette = {
  light: {
    background: '#F5F3F6',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    surfaceTint: '#E9ECF3',
    text: '#38323F',
    textSecondary: '#625D68',
    textMuted: '#716B78',
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
  dark: {
    background: '#17171D',
    surface: '#22222B',
    surfaceRaised: '#292933',
    surfaceTint: '#313746',
    text: '#F5F3F6',
    textSecondary: '#D0CBD5',
    textMuted: '#AAA4B0',
    accent: '#AEB9D4',
    accentStrong: '#AEB9D4',
    accentPressed: '#C3CCE0',
    onAccent: '#222635',
    border: '#3C3A45',
    divider: '#34323C',
    success: '#7CC6A1',
    warning: '#E4B66D',
    error: '#F09AA1',
    disabled: '#77737E',
    skeleton: '#32313B',
    focus: '#C1D0F3',
  },
} as const;

export type AppColors = { [Key in keyof (typeof palette)['light']]: string };

export function useAppColors(): AppColors {
  return palette[useColorScheme() === 'dark' ? 'dark' : 'light'];
}
