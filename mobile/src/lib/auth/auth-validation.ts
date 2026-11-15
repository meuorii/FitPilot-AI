import type { AboutYouDraft, CalculateGoalsRequest } from './auth-types';

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  return {
    email: normalizedEmail,
    errors: {
      email: !normalizedEmail ? 'Enter your email address.' : !validEmail.test(normalizedEmail) ? 'Enter a valid email address.' : '',
      password: password ? '' : 'Enter your password.',
    },
  };
}

export function validateRegistration(fullName: string, email: string, password: string, confirmation: string) {
  const normalizedName = fullName.trim();
  const normalizedEmail = normalizeEmail(email);
  return {
    fullName: normalizedName,
    email: normalizedEmail,
    errors: {
      fullName: normalizedName ? '' : 'Enter your name.',
      email: !normalizedEmail ? 'Enter your email address.' : !validEmail.test(normalizedEmail) ? 'Enter a valid email address.' : '',
      password: password.length < 8 ? 'Use at least 8 characters.' : '',
      confirmation: confirmation !== password ? 'Passwords do not match.' : '',
    },
  };
}

export function validateAboutYou(values: AboutYouDraft): { payload: CalculateGoalsRequest | null; errors: Record<string, string> } {
  const age = Number(values.age);
  const height = Number(values.height_cm);
  const weight = Number(values.weight_kg);
  const parsed = {
    age: Number.isFinite(age) && age >= 13 && age <= 100 ? age : null,
    height_cm: Number.isFinite(height) && height >= 100 && height <= 250 ? height : null,
    weight_kg: Number.isFinite(weight) && weight >= 30 && weight <= 350 ? weight : null,
  };
  const errors = {
    age: parsed.age === null ? 'Age must be between 13 and 100.' : '',
    height_cm: parsed.height_cm === null ? 'Height must be between 100 and 250 cm.' : '',
    weight_kg: parsed.weight_kg === null ? 'Weight must be between 30 and 350 kg.' : '',
    gender: values.gender ? '' : 'Select a gender.',
    activity_level: values.activity_level ? '' : 'Choose the activity level closest to your usual week.',
  };
  const valid = !Object.values(errors).some(Boolean) && parsed.age !== null && parsed.height_cm !== null && parsed.weight_kg !== null && Boolean(values.gender && values.activity_level);
  return {
    errors,
    payload: valid ? {
      age: parsed.age!, gender: values.gender as 'male' | 'female', height_cm: parsed.height_cm!,
      weight_kg: parsed.weight_kg!, activity_level: values.activity_level as CalculateGoalsRequest['activity_level'],
    } : null,
  };
}

export function onboardingBaselineKey(values: AboutYouDraft) {
  return [values.age.trim(), values.gender, values.height_cm.trim(), values.weight_kg.trim(), values.activity_level].join('|');
}

export function authenticatedDestination(isOnboarded: boolean) {
  return isOnboarded ? '/(app)/(tabs)' : '/(onboarding)/welcome';
}
