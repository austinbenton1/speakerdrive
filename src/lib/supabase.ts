import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error('Missing environment variable: VITE_SUPABASE_URL');
if (!supabaseAnonKey) throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY');

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'speakerdrive-web'
    }
  },
  db: {
    schema: 'public'
  },
  // Add retrying for failed requests
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Add error handling for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    // Clear any application cache/storage
    localStorage.removeItem('supabase.auth.token');
  }
});

// Add request error handling
const originalAuthRequest = supabase.auth.api;
if (originalAuthRequest) {
  supabase.auth.api = new Proxy(originalAuthRequest, {
    get(target, property) {
      const originalMethod = target[property];
      if (typeof originalMethod === 'function') {
        return async (...args) => {
          try {
            const result = await originalMethod.apply(target, args);
            return result;
          } catch (error) {
            console.error(`Supabase auth error (${property}):`, error);
            throw error;
          }
        };
      }
      return originalMethod;
    }
  });
}

// Add retry mechanism for failed requests
export const fetchWithRetry = async (fetcher: () => Promise<any>, maxRetries = 3) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetcher();
    } catch (error) {
      lastError = error;
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw lastError;
};