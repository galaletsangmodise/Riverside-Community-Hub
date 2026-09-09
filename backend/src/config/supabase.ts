import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Missing Supabase env vars — check your .env file');
}

const realtimeOptions = {
  transport: ws as any,
};

export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: realtimeOptions,
});

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  realtime: realtimeOptions,
});