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
        .eq('email', supabaseUser.email)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        // Fallback to basic Supabase user data
        const basicUser: User = {
          id: supabaseUser.id,
          username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'User',
          name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.username || 'User',
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
        name: userData.username, // Default to username if no separate name field
        email: userData.email,
        role: userData.role,
        balance: userData.balance
      };

      setUser(mappedUser);
      localStorage.setItem('user', JSON.stringify(mappedUser));
    } catch (err) {
      console.error('Sync user data error:', err);
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
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
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username // Store username in user metadata
          },
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Create user record in public.users table
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            username,
            email,
            role: 'user',
            balance: 0,
            is_verified: false
          }]);

        if (insertError) {
          console.error('Error creating user record:', insertError);
        }
      }

      // Supabase will send verification email automatically
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const loginWithGoogle = async () => {
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