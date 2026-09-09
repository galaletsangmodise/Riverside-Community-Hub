import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Missing Supabase env vars — check your .env file');
}

// used to verify incoming JWTs from the frontend (safe: respects RLS)
export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

// used ONLY server-side for privileged operations (bypasses RLS — never expose)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);