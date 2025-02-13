import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes after initialization
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted && initialized) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { data: null, error };
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut({ 
        scope: 'global' 
      });
      
      if (error) throw error;

      // Clear any remaining auth data
      window.localStorage.removeItem('supabase.auth.token');
      window.localStorage.removeItem('supabase.auth.refreshToken');
      
      setUser(null);
      return { error: null };
    } catch (error) {
      console.error('Logout error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    initialized,
    isAuthenticated: !!user,
    login,
    logout,
  };
}