/**
 * Supabase Client Configuration for Frontend
 * Used for OAuth authentication flow
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client for frontend OAuth
// If credentials are missing, create a dummy client to prevent app crash
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    })
    : createClient('https://placeholder.supabase.co', 'placeholder-key', {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
        }
    });

// Log warning if credentials are missing
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials not configured. Google OAuth will not work. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}
