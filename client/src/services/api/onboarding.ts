import type { CalculateGoalsRequest, CalculateGoalsResponse, CompleteOnboardingRequest, CompleteOnboardingResponse } from '../types/onboarding';

export const BASE_URL = 'http://localhost:5000/api/v1';

export const calculateGoals = async (payload: CalculateGoalsRequest, token: string): Promise<CalculateGoalsResponse> => {
  const response = await fetch(`${BASE_URL}/profile/calculate-goals`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  const result = (await response.json().catch(() => null)) as CalculateGoalsResponse | null;
  if (!response.ok || !result?.success) throw new Error(result?.message || `Calculating goals failed with status ${response.status}.`);
  return result;
};

export const completeOnboarding = async (payload: CompleteOnboardingRequest, token: string): Promise<CompleteOnboardingResponse> => {
  const response = await fetch(`${BASE_URL}/profile/me`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  const result = (await response.json().catch(() => null)) as CompleteOnboardingResponse | null;
  if (!response.ok || !result?.success) throw new Error(result?.message || `Updating profile failed with status ${response.status}.`);
  return result;
};