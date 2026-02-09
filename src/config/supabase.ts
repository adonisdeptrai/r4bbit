/**
 * Supabase Client Configuration for Frontend
 * Fully typed with Database schema
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create typed Supabase client for frontend
let supabaseClient: SupabaseClient<Database> | null = null;

if (supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    });
} else {
    console.warn('⚠️ Supabase credentials not configured. OAuth and database operations will not work.');
    console.warn('   Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

// Export typed client
export const supabase = supabaseClient!;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => !!supabaseClient;

// Re-export types for convenience
export type { Database } from './database.types';
