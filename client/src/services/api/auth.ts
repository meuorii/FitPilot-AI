import type { LoginRequest, LoginResponse } from '../types/auth';
import type { RegisterRequest, RegisterResponse } from '../types/auth';

export const BASE_URL = 'http://localhost:5000/api/v1';

export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const result = (await response.json().catch(() => null)) as LoginResponse | null;
  if (!response.ok || !result?.success) throw new Error(result?.message || `Login failed with status ${response.status}.`);

  return result;
};

export const registerUser = async (credentials: RegisterRequest): Promise<RegisterResponse> => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const result = (await response.json().catch(() => null)) as RegisterResponse | null;
  if (!response.ok || !result?.success) {
    throw new Error(result?.message || `Registration failed with status ${response.status}.`);
  }

  return result;
};