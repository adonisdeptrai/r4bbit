import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../config/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync Supabase session with React state
  useEffect(() => {
    // Skip if Supabase not configured
    if (!supabase) {
      console.warn('Supabase not configured, skipping auth sync');
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUserData(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);

      if (session?.user) {
        await syncUserData(session.user);
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync additional user data from public.users table
  const syncUserData = async (supabaseUser: SupabaseUser) => {
    try {
      // Fetch additional data from public.users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id) // Use ID for better accuracy
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        // Fallback to basic Supabase user data
        const basicUser: User = {
          id: supabaseUser.id,
          username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'User',
          name: supabaseUser.user_metadata?.username || 'User',
          email: supabaseUser.email || '',
          role: 'user',
          balance: 0
        };
        setUser(basicUser);
        localStorage.setItem('user', JSON.stringify(basicUser));
        return;
      }

      const mappedUser: User = {
        id: userData.id,
        username: userData.username,
        name: userData.username,
        email: userData.email,
        role: userData.role,
        balance: userData.balance
      };

      // If user is verified in Supabase but not in our state, we could reflect that locally
      // but the server is the source of truth for the 'role' and 'balance'.

      setUser(mappedUser);
      localStorage.setItem('user', JSON.stringify(mappedUser));
    } catch (err) {
      console.error('Sync user data error:', err);
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase not configured. Please check environment variables.');
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // User data will be synced via onAuthStateChange
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase not configured. Please check environment variables.');
    }

    try {
      // Sign up directly with Supabase Client
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });

      if (error) throw error;

      // Note: The public.users record will be created automatically by the Postgres trigger
      // after the user confirms their email.
      return;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const loginWithGoogle = async () => {
    if (!supabase) {
      throw new Error('Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local');
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;

      // Supabase will redirect to Google
    } catch (error: any) {
      console.error('Google login error:', error);
      throw new Error(error.message || 'Google login failed');
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};