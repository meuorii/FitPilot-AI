import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ResendVerificationRequest, ResendVerificationResponse, VerifyEmailRequest, VerifyEmailResponse } from '../types/auth';

export const BASE_URL = 'http://localhost:5000/api/v1';

export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
  const result = (await response.json().catch(() => null)) as LoginResponse | null;
  if (!response.ok || !result?.success) throw new Error(result?.message || `Login failed with status ${response.status}.`);
  return result;
};

export const registerUser = async (credentials: RegisterRequest): Promise<RegisterResponse> => {
  const response = await fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
  const result = (await response.json().catch(() => null)) as RegisterResponse | null;
  if (!response.ok || !result?.success) throw new Error(result?.message || `Registration failed with status ${response.status}.`);
  return result;
};

export const verifyEmail = async (payload: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
  const response = await fetch(`${BASE_URL}/auth/verify-email`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const result = (await response.json().catch(() => null)) as VerifyEmailResponse | null;
  if (!response.ok || !result?.success) throw new Error(result?.message || `Email verification failed with status ${response.status}.`);
  return result;
};

export const resendVerification = async (payload: ResendVerificationRequest): Promise<ResendVerificationResponse> => {
  const response = await fetch(`${BASE_URL}/auth/resend-verification`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const result = (await response.json().catch(() => null)) as ResendVerificationResponse | null;
  if (!response.ok || !result?.success) throw new Error(result?.message || `Resending verification code failed with status ${response.status}.`);
  return result;
};