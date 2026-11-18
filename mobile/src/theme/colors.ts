/** Approved FitPilot Cool Blue-Gray brand scale. */
export const brand = {
  50: '#F1F4F9',
  100: '#E1E8F2',
  200: '#C7D2E3',
  300: '#AABAD1',
  400: '#869AB8',
  500: '#5A729D',
  600: '#4D638A',
  700: '#445A82',
  800: '#384A6A',
  900: '#2C3B54',
} as const;

/** Neutral scale for supporting surfaces, borders, and typography. */
export const neutral = {
  0: '#FFFFFF',
  50: '#F9FAFC',
  100: '#F1F4F8',
  200: '#E3E8F1',
  300: '#C8D2E1',
  400: '#A5B1C2',
  500: '#8A94A6',
  600: '#5F6C82',
  700: '#465368',
  800: '#2F3C50',
  900: '#1F2A3D',
} as const;

export const semantic = {
  successLight: '#EEF8F2',
  successBase: '#32985F',
  successStrong: '#267C4C',
  warningLight: '#FFF8EA',
  warningBase: '#C98A1E',
  warningStrong: '#9F6B12',
  errorLight: '#FFF1F2',
  errorBase: '#D94357',
  errorStrong: '#B62E42',
  informationLight: '#EFF5FC',
  informationBase: '#3D78B4',
  informationStrong: '#2F5F90',
} as const;

/**
 * Stable semantic API consumed by mobile screens and shared components.
 * Secondary/muted text use stronger neutral pairings than the palest scale
 * steps so they remain readable on both white and tinted surfaces.
 */
export const palette = {
  light: {
    background: '#F5F7FB',
    backgroundSubtle: '#EEF2F8',
    surface: neutral[0],
    surfaceRaised: neutral[0],
    surfaceTint: '#D9E1EE',
    surfacePressed: '#EAF0F8',
    text: neutral[900],
    textSecondary: neutral[700],
    textMuted: neutral[600],
    accent: brand[500],
    accentStrong: brand[700],
    accentPressed: brand[800],
    onAccent: neutral[0],
    border: neutral[200],
    borderStrong: neutral[300],
    controlBorder: neutral[600],
    divider: neutral[200],
    success: semantic.successStrong,
    successLight: semantic.successLight,
    // Warning text uses an approved dark neutral; amber remains available for indicators.
    warning: neutral[800],
    warningStrong: semantic.warningStrong,
    warningLight: semantic.warningLight,
    error: semantic.errorStrong,
    errorLight: semantic.errorLight,
    information: semantic.informationStrong,
    informationLight: semantic.informationLight,
    disabled: neutral[200],
    disabledText: neutral[600],
    skeleton: neutral[200],
    focus: brand[700],
  },
} as const;

export type AppColors = { [Key in keyof (typeof palette)['light']]: string };

export function useAppColors(): AppColors {
  return palette.light;
}
