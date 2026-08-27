export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { email: string; password: string; full_name: string; }
export interface VerifyEmailRequest { email: string; code: string; }
export interface ResendVerificationRequest { email: string; }
export interface User { id: string; email: string; full_name: string; is_onboarded: boolean; email_verified: boolean; }
export interface AuthData { token: string; user: User; }
export interface RegisterData { email: string; requires_email_verification: boolean; }
export interface VerifyEmailData extends AuthData { next_step: 'onboarding'; }
export interface ResendVerificationData { email: string; }
export interface LoginResponse { success: boolean; message: string; data: AuthData; }
export interface RegisterResponse { success: boolean; message: string; data: RegisterData; }
export interface VerifyEmailResponse { success: boolean; message: string; data: VerifyEmailData; }
export interface ResendVerificationResponse { success: boolean; message: string; data?: ResendVerificationData; }