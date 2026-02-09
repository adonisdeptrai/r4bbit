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
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      try {
        if (session?.user) {
          localStorage.setItem('token', session.access_token);
          await syncUserData(session.user);
        } else {
          setUser(null);
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Error in initial session sync:', err);
      } finally {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state changed:', event, session?.user?.email);

      if (session?.user && session?.access_token) {
        // CRITICAL: Set token immediately
        localStorage.setItem('token', session.access_token);
        console.log('AuthContext: Token synced to localStorage');

        // Sync user data
        await syncUserData(session.user);
      } else if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync additional user data from public.users table
  const syncUserData = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('AuthContext: syncUserData starting for', supabaseUser.id);

      // Double check token if missing
      if (!localStorage.getItem('token')) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          localStorage.setItem('token', session.access_token);
        }
      }

      // Fetch additional data from public.users table with timeout
      const fetchUserData = async () => {
        return await supabase
          .from('users')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();
      };

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 10000)
      );

      // @ts-ignore
      const { data: userData, error } = await Promise.race([
        fetchUserData(),
        timeoutPromise
      ]).catch(err => ({ data: null, error: err }));

      if (error) {
        console.error('AuthContext: Error fetching user data (or timeout):', error);

        // Fallback: Try to get role from metadata, default to 'user'
        const fallbackRole = supabaseUser.user_metadata?.role || 'user';
        console.log('AuthContext: Using fallback role:', fallbackRole);

        // Fallback to basic Supabase user data but DO NOT FAIL LOGIN
        const basicUser: User = {
          id: supabaseUser.id,
          username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'User',
          name: supabaseUser.user_metadata?.username || 'User',
          email: supabaseUser.email || '',
          role: fallbackRole,
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

      console.log('AuthContext: syncUserData complete', mappedUser);
      setUser(mappedUser);
      localStorage.setItem('user', JSON.stringify(mappedUser));
    } catch (err) {
      console.error('AuthContext: Sync user data error:', err);
      // Even if sync fails, we should stop loading to avoid UI hang
    } finally {
      // Ensure loading is set to false in case this is called directly
      // But in onAuthStateChange it's handled there.
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
      console.log('AuthContext: register called', { username, email });
      // Check if username already exists in public.users before signing up
      console.log('AuthContext: checking existing username');
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (checkError) {
        console.error('AuthContext: Error checking existing user:', checkError);
      }

      if (existingUser) {
        console.warn('AuthContext: Username collision');
        throw new Error('Username already exists. Please choose another one.');
      }

      // Sign up directly with Supabase Client
      console.log('AuthContext: calling supabase.auth.signUp');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          },
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      });

      if (error) {
        console.error('AuthContext: supabase.auth.signUp error:', error);
        throw error;
      }

      console.log('AuthContext: signUp successful');
      return;
    } catch (error: any) {
      console.error('Registration error detailed:', error);
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