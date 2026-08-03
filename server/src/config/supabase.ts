import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Client bound to standard user permissions (Adheres to RLS)
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
  },
});

// Admin Client (Bypasses RLS - strictly for backend background processes)
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
});