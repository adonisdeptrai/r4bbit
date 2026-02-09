/**
 * Supabase Client Configuration for Frontend
 * Used for OAuth authentication flow
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client for frontend OAuth
// If credentials are missing, return null to prevent connection attempts
let supabaseClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    });
} else {
    console.warn('⚠️ Supabase credentials not configured. Google OAuth will not work. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = supabaseClient as any; // Type assertion for compatibility
