import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rfrlddiebyfojnzbfldy.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcmxkZGllYnlmb2puemJmbGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMDQ3MDgsImV4cCI6MjA5NDg4MDcwOH0.3nHfDHpkVPUNyxz65_IOPqx8H0F1QA6kxzi1AHFI7oU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
});
