import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_ORIGIN: z.string().default('*'),
  SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'Supabase Anon Key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase Service Role Key is required'),
  HF_AI_SERVICE_URL: z.string().url('Invalid AI Service URL').default('http://localhost:8000'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  INTERNAL_API_KEY: z.string().default('fitpilot_internal_secret_key_2026'),
});

export const env = envSchema.parse(process.env);