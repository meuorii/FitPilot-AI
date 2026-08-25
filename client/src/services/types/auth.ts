export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_onboarded: boolean;
}

export interface AuthData {
  token: string;
  user: User;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: AuthData;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: AuthData;
}