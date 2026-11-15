import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import type { AboutYouDraft, GoalOption, Profile } from '@/lib/auth/auth-types';
import { emptyAboutYouDraft } from '@/lib/auth/auth-types';

type DraftValue = {
  aboutYou: AboutYouDraft;
  goalOptions: GoalOption[];
  selectedGoal: GoalOption | null;
  calculatedFor: string | null;
  savedProfile: Profile | null;
  updateAboutYou: <K extends keyof AboutYouDraft>(key: K, value: AboutYouDraft[K]) => void;
  saveGoalOptions: (options: GoalOption[], baseline: string) => void;
  selectGoal: (goal: GoalOption) => void;
  saveProfile: (profile: Profile) => void;
  resetDraft: () => void;
};

const DraftContext = createContext<DraftValue | null>(null);

export function OnboardingDraftProvider({ children }: PropsWithChildren) {
  const [aboutYou, setAboutYou] = useState<AboutYouDraft>(emptyAboutYouDraft);
  const [goalOptions, setGoalOptions] = useState<GoalOption[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<GoalOption | null>(null);
  const [calculatedFor, setCalculatedFor] = useState<string | null>(null);
  const [savedProfile, setSavedProfile] = useState<Profile | null>(null);

  const updateAboutYou = useCallback(<K extends keyof AboutYouDraft>(key: K, value: AboutYouDraft[K]) => {
    if (aboutYou[key] === value) return;
    setAboutYou({ ...aboutYou, [key]: value });
    setGoalOptions([]);
    setSelectedGoal(null);
    setCalculatedFor(null);
  }, [aboutYou]);

  const saveGoalOptions = useCallback((options: GoalOption[], baseline: string) => {
    const initial = options.find((goal) => goal.is_recommended) ?? options[0] ?? null;
    setGoalOptions(options);
    setSelectedGoal((current) => options.find((goal) => goal.goal === current?.goal) ?? initial);
    setCalculatedFor(baseline);
  }, []);
  const selectGoal = useCallback((goal: GoalOption) => setSelectedGoal(goal), []);
  const saveProfile = useCallback((profile: Profile) => setSavedProfile(profile), []);
  const resetDraft = useCallback(() => {
    setAboutYou(emptyAboutYouDraft);
    setGoalOptions([]);
    setSelectedGoal(null);
    setCalculatedFor(null);
    setSavedProfile(null);
  }, []);

  const value = useMemo(() => ({ aboutYou, goalOptions, selectedGoal, calculatedFor, savedProfile, updateAboutYou, saveGoalOptions, selectGoal, saveProfile, resetDraft }), [aboutYou, goalOptions, selectedGoal, calculatedFor, savedProfile, updateAboutYou, saveGoalOptions, selectGoal, saveProfile, resetDraft]);
  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useOnboardingDraft() {
  const value = useContext(DraftContext);
  if (!value) throw new Error('useOnboardingDraft must be used inside OnboardingDraftProvider.');
  return value;
}
