import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) { res.status(400).json({ success: false, message: 'Please provide email, password, and full name' }); return; }
    const { data: existingUser } = await supabaseAdmin.from('profiles').select('id').eq('email', email).single();
    if (existingUser) { res.status(400).json({ success: false, message: 'Email is already registered' }); return; }
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data: newUser, error } = await supabaseAdmin.from('profiles').insert([{ email, password_hash: hashedPassword, full_name, is_onboarded: false }]).select('id, email, full_name, is_onboarded').single();
    if (error) throw error;
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, message: 'Account registered successfully.', data: { token, user: newUser } });
  } catch (err) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { data: user, error } = await supabaseAdmin.from('profiles').select('id, email, full_name, password_hash, is_onboarded').eq('email', email).single();
    if (error || !user || !(await bcrypt.compare(password, user.password_hash))) { res.status(401).json({ success: false, message: 'Invalid email or password' }); return; }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ success: true, message: 'Logged in successfully', data: { token, user: { id: user.id, email: user.email, full_name: user.full_name, is_onboarded: user.is_onboarded } } });
  } catch (err) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Login failed' });
  }
};