import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { sendVerificationEmail } from '../services/email.service.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured.');

const VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000;

const normalizeEmail = (email: unknown): string => String(email ?? '').trim().toLowerCase();
const hashVerificationCode = (code: string): string => createHash('sha256').update(code).digest('hex');

const verificationCodesMatch = (submittedCode: string, storedHash: string): boolean => {
  const submittedHashBuffer = Buffer.from(hashVerificationCode(submittedCode), 'hex');
  const storedHashBuffer = Buffer.from(storedHash, 'hex');
  if (submittedHashBuffer.length !== storedHashBuffer.length) return false;
  return timingSafeEqual(submittedHashBuffer, storedHashBuffer);
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, full_name } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const normalizedFullName = String(full_name ?? '').trim();
    if (!normalizedEmail || !password || !normalizedFullName) { res.status(400).json({ success: false, message: 'Please provide email, password, and full name' }); return; }
    const { data: existingUser, error: existingUserError } = await supabaseAdmin.from('profiles').select('id, email, email_verified').eq('email', normalizedEmail).maybeSingle();
    if (existingUserError) throw existingUserError;
    if (existingUser) {
      if (!existingUser.email_verified) { res.status(409).json({ success: false, message: 'This email is already registered but has not been verified.', code: 'EMAIL_NOT_VERIFIED', data: { email: existingUser.email } }); return; }
      res.status(409).json({ success: false, message: 'Email is already registered' }); return;
    }
    const hashedPassword = await bcrypt.hash(String(password), 10);
    const verificationCode = randomInt(100000, 1000000).toString();
    const hashedVerificationCode = hashVerificationCode(verificationCode);
    const verificationExpiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);
    const { data: newUser, error } = await supabaseAdmin.from('profiles').insert([{ email: normalizedEmail, password_hash: hashedPassword, full_name: normalizedFullName, is_onboarded: false, email_verified: false, email_verification_code: hashedVerificationCode, email_verification_expires_at: verificationExpiresAt.toISOString() }]).select('id, email, full_name, is_onboarded, email_verified').single();
    if (error) throw error;
    await sendVerificationEmail(newUser.email, verificationCode);
    res.status(201).json({ success: true, message: 'Account created. Check your email for the 6-digit verification code.', data: { email: newUser.email, requires_email_verification: true } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Registration failed' });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const normalizedCode = String(code ?? '').trim();
    if (!normalizedEmail || !normalizedCode) { res.status(400).json({ success: false, message: 'Email and verification code are required.' }); return; }
    if (!/^\d{6}$/.test(normalizedCode)) { res.status(400).json({ success: false, message: 'Verification code must contain exactly 6 digits.', code: 'INVALID_VERIFICATION_CODE_FORMAT' }); return; }
    const { data: user, error } = await supabaseAdmin.from('profiles').select('id, email, full_name, is_onboarded, email_verified, email_verification_code, email_verification_expires_at').eq('email', normalizedEmail).maybeSingle();
    if (error) throw error;
    if (!user) { res.status(400).json({ success: false, message: 'Invalid verification request.' }); return; }
    if (user.email_verified) { res.status(400).json({ success: false, message: 'Email is already verified.', code: 'EMAIL_ALREADY_VERIFIED' }); return; }
    if (!user.email_verification_code || !user.email_verification_expires_at) { res.status(400).json({ success: false, message: 'No active verification code found. Please request a new code.', code: 'NO_ACTIVE_VERIFICATION_CODE' }); return; }
    const expiresAt = new Date(user.email_verification_expires_at).getTime();
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) { res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.', code: 'VERIFICATION_CODE_EXPIRED' }); return; }
    if (!verificationCodesMatch(normalizedCode, user.email_verification_code)) { res.status(400).json({ success: false, message: 'Invalid verification code.', code: 'INVALID_VERIFICATION_CODE' }); return; }
    const { data: verifiedUser, error: updateError } = await supabaseAdmin.from('profiles').update({ email_verified: true, email_verification_code: null, email_verification_expires_at: null, updated_at: new Date().toISOString() }).eq('id', user.id).select('id, email, full_name, is_onboarded, email_verified').single();
    if (updateError) throw updateError;
    const token = jwt.sign({ id: verifiedUser.id, email: verifiedUser.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ success: true, message: 'Email verified successfully.', data: { token, user: { id: verifiedUser.id, email: verifiedUser.email, full_name: verifiedUser.full_name, is_onboarded: verifiedUser.is_onboarded, email_verified: verifiedUser.email_verified }, next_step: verifiedUser.is_onboarded ? 'dashboard' : 'onboarding' } });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Email verification failed' });
  }
};

export const resendVerificationCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);
    if (!normalizedEmail) { res.status(400).json({ success: false, message: 'Email is required.' }); return; }
    const { data: user, error } = await supabaseAdmin.from('profiles').select('id, email, email_verified').eq('email', normalizedEmail).maybeSingle();
    if (error) throw error;
    if (!user) { res.status(200).json({ success: true, message: 'If this email is registered, a new verification code has been sent.' }); return; }
    if (user.email_verified) { res.status(400).json({ success: false, message: 'Email is already verified.', code: 'EMAIL_ALREADY_VERIFIED' }); return; }
    const verificationCode = randomInt(100000, 1000000).toString();
    const hashedVerificationCode = hashVerificationCode(verificationCode);
    const verificationExpiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);
    const { error: updateError } = await supabaseAdmin.from('profiles').update({ email_verification_code: hashedVerificationCode, email_verification_expires_at: verificationExpiresAt.toISOString(), updated_at: new Date().toISOString() }).eq('id', user.id);
    if (updateError) throw updateError;
    await sendVerificationEmail(user.email, verificationCode);
    res.status(200).json({ success: true, message: 'A new verification code has been sent.', data: { email: user.email } });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Failed to resend verification code' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) { res.status(400).json({ success: false, message: 'Email and password are required.' }); return; }
    const { data: user, error } = await supabaseAdmin.from('profiles').select('id, email, full_name, password_hash, is_onboarded, email_verified').eq('email', normalizedEmail).maybeSingle();
    if (error || !user) { res.status(401).json({ success: false, message: 'Invalid email or password' }); return; }
    const passwordMatches = await bcrypt.compare(String(password), user.password_hash);
    if (!passwordMatches) { res.status(401).json({ success: false, message: 'Invalid email or password' }); return; }
    if (!user.email_verified) { res.status(403).json({ success: false, message: 'Please verify your email before logging in.', code: 'EMAIL_NOT_VERIFIED', data: { email: user.email } }); return; }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ success: true, message: 'Logged in successfully', data: { token, user: { id: user.id, email: user.email, full_name: user.full_name, is_onboarded: user.is_onboarded, email_verified: user.email_verified } } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Login failed' });
  }
};