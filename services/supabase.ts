import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use a valid placeholder URL and key format to prevent SDK crash during initialization.
// The app will still fail gracefully at login if credentials are missing/invalid.
const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
// A valid-format anon key (this is a dummy, not a real key)
const PLACEHOLDER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.placeholder';

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key is missing. Check your Vercel environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).');
}

export const supabase: SupabaseClient = createClient(
    supabaseUrl || PLACEHOLDER_URL,
    supabaseKey || PLACEHOLDER_KEY
);

