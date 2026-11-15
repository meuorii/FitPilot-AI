export const roccoAssets = {
  dashboard: require('../../../assets/images/rocco/rocco-dashboard.png') as number,
  workout: require('../../../assets/images/rocco/rocco-workout-hero.png') as number,
  meals: require('../../../assets/images/rocco/rocco-meal-hero.png') as number,
  coach: require('../../../assets/images/rocco/rocco-coach-hero.png') as number,
  coachAvatar: require('../../../assets/images/rocco/rocco-coach-avatar.png') as number,
  progress: require('../../../assets/images/rocco/rocco-progress-hero.png') as number,
  settings: require('../../../assets/images/rocco/rocco-settings-hero.png') as number,
  logout: require('../../../assets/images/rocco/rocco-logout-wave.png') as number,
} as const;

export type RoccoVariant = keyof typeof roccoAssets;

export const roccoDescriptions: Record<RoccoVariant, string> = {
  dashboard: 'Rocco, the FitPilot wolf mascot',
  workout: 'Rocco ready to train',
  meals: 'Rocco supporting your nutrition journey',
  coach: 'Rocco, your FitPilot coach',
  coachAvatar: 'Rocco the wolf mascot',
  progress: 'Rocco celebrating steady progress',
  settings: 'Rocco beside your FitPilot settings',
  logout: 'Rocco waving goodbye',
};
