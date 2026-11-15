import { ApiError, apiRequest } from '@/lib/api/api-client';
import type { AuthUser, CalculateGoalsRequest, CompleteOnboardingRequest, GoalOption, Profile } from './auth-types';

export type LoginResult = { token: string; user: AuthUser };
export type VerifyResult = LoginResult & { next_step: 'onboarding' | 'dashboard' };
export type RegisterResult = { email: string; requires_email_verification: true };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function objectData<T>(value: unknown, label: string): T {
  if (!isRecord(value) || value.success !== true || !isRecord(value.data)) {
    throw new ApiError(`The server returned an unexpected ${label} response.`, 502);
  }
  return value.data as T;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) throw new ApiError(`The server returned an incomplete ${field}.`, 502);
  return value;
}

function parseUser(value: unknown): AuthUser {
  if (!isRecord(value) || typeof value.is_onboarded !== 'boolean' || typeof value.email_verified !== 'boolean') {
    throw new ApiError('The server returned incomplete account information.', 502);
  }
  return {
    id: requiredString(value.id, 'account ID'),
    email: requiredString(value.email, 'email address'),
    full_name: requiredString(value.full_name, 'name'),
    is_onboarded: value.is_onboarded,
    email_verified: value.email_verified,
  };
}

function parseLogin(value: unknown): LoginResult {
  const data = objectData<Record<string, unknown>>(value, 'sign-in');
  return { token: requiredString(data.token, 'access token'), user: parseUser(data.user) };
}

const goalValues = ['lose_weight', 'lose_fat', 'maintain', 'gain_muscle'] as const;
function parseGoalOptions(value: unknown): GoalOption[] {
  if (!Array.isArray(value)) throw new ApiError('The server returned invalid goal options.', 502);
  return value.map((candidate) => {
    if (!isRecord(candidate) || !goalValues.includes(candidate.goal as typeof goalValues[number]) || typeof candidate.label !== 'string' || typeof candidate.is_recommended !== 'boolean' || !isRecord(candidate.metrics)) {
      throw new ApiError('The server returned an invalid fitness goal.', 502);
    }
    const target = candidate.recommended_target_weight_kg;
    const metrics = candidate.metrics;
    const metricKeys = ['bmi', 'bmr', 'tdee', 'daily_calories', 'protein_grams', 'carbs_grams', 'fat_grams'] as const;
    if (typeof target !== 'number' || !Number.isFinite(target) || target <= 0 || typeof metrics.bmi_category !== 'string' || metricKeys.some((key) => typeof metrics[key] !== 'number' || !Number.isFinite(metrics[key]))) {
      throw new ApiError('The server returned incomplete fitness targets.', 502);
    }
    return candidate as unknown as GoalOption;
  });
}

function authMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) return fallback;
  switch (error.code) {
    case 'EMAIL_NOT_VERIFIED': return 'Verify your email before signing in. We can send you a new code.';
    case 'EMAIL_ALREADY_VERIFIED': return 'This email is already verified. Sign in to continue.';
    case 'INVALID_VERIFICATION_CODE_FORMAT': return 'Enter all six digits from your email.';
    case 'INVALID_VERIFICATION_CODE': return 'That code does not match. Check your email and try again.';
    case 'VERIFICATION_CODE_EXPIRED': return 'That code has expired. Request a new code to continue.';
    case 'NO_ACTIVE_VERIFICATION_CODE': return 'There is no active code for this email. Request a new one.';
    case 'EMAIL_SERVICE_UNAVAILABLE': return 'FitPilot could not send the verification email. Please try again later.';
    case 'TIMEOUT':
    case 'NETWORK_ERROR': return 'FitPilot could not be reached. Check your connection and try again.';
    default:
      if (error.status === 401) return 'The email or password is incorrect.';
      if (error.status === 403) return 'This account cannot continue yet. Check your email verification and try again.';
      if (error.status === 409) return 'An account already uses this email. Sign in or verify the existing account.';
      if (error.status === 429) return 'There have been too many attempts. Wait a little while, then try again.';
      if (error.status === 503) return 'FitPilot is temporarily unavailable. Try again in a moment.';
      if (error.status >= 500) return 'FitPilot is having trouble right now. Your details are still here; try again shortly.';
      if (error.status === 400) return error.message;
      return fallback;
  }
}

export const authApi = {
  async register(fullName: string, email: string, password: string, signal?: AbortSignal): Promise<RegisterResult> {
    const value = await apiRequest<unknown>('/auth/register', {
      method: 'POST', authenticated: false, signal,
      body: { full_name: fullName, email, password },
    });
    const data = objectData<Record<string, unknown>>(value, 'registration');
    if (data.requires_email_verification !== true) throw new ApiError('Registration did not confirm email verification is required.', 502);
    return { email: requiredString(data.email, 'registration email'), requires_email_verification: true };
  },

  async login(email: string, password: string, signal?: AbortSignal): Promise<LoginResult> {
    return parseLogin(await apiRequest<unknown>('/auth/login', {
      method: 'POST', authenticated: false, signal, body: { email, password },
    }));
  },

  async verify(email: string, code: string, signal?: AbortSignal): Promise<VerifyResult> {
    const data = objectData<Record<string, unknown>>(await apiRequest<unknown>('/auth/verify-email', {
      method: 'POST', authenticated: false, signal, body: { email, code },
    }), 'verification');
    if (data.next_step !== 'onboarding' && data.next_step !== 'dashboard') throw new ApiError('The server returned an unknown next step.', 502);
    const result = parseLogin({ success: true, data });
    return { ...result, next_step: data.next_step };
  },

  async resend(email: string, signal?: AbortSignal): Promise<string> {
    const value = await apiRequest<unknown>('/auth/resend-verification', {
      method: 'POST', authenticated: false, signal, body: { email },
    });
    if (!isRecord(value) || value.success !== true) throw new ApiError('The server could not confirm the resend request.', 502);
    return typeof value.message === 'string' ? value.message : 'If this email is registered, a new code will be sent.';
  },

  async profile(signal?: AbortSignal): Promise<Profile> {
    const value = await apiRequest<unknown>('/profile/me', { method: 'GET', signal });
    const raw = objectData<Record<string, unknown>>(value, 'profile');
    const user = parseUser(raw);
    return { ...raw, ...user } as Profile;
  },

  async calculateGoals(input: CalculateGoalsRequest, signal?: AbortSignal): Promise<GoalOption[]> {
    const value = await apiRequest<unknown>('/profile/calculate-goals', { method: 'POST', signal, body: input });
    if (!isRecord(value) || value.success !== true) throw new ApiError('The server returned invalid goal options.', 502);
    return parseGoalOptions(value.data);
  },

  async saveOnboarding(input: CompleteOnboardingRequest, signal?: AbortSignal): Promise<Profile> {
    const value = await apiRequest<unknown>('/profile/me', { method: 'PATCH', signal, body: input });
    const raw = objectData<Record<string, unknown>>(value, 'saved profile');
    const profile = { ...raw, ...parseUser(raw) } as Profile;
    if (!profile.is_onboarded) throw new ApiError('FitPilot did not confirm that onboarding was saved.', 502);
    return profile;
  },

  messageForError: authMessage,
};
