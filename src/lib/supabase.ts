import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { validateEnv } from './env';

// Supabase configuration
const supabaseUrl = 'https://wpnhjwajdkedxttyzhsy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwbmhqd2FqZGtlZHh0dHl6aHN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0NDY5MTAsImV4cCI6MjA1MzAyMjkxMH0.gKeFwgRlToyiWp6ju67GlEsiE4br_VLvWo3BldC6vPE';

// Add retry logic for failed requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function retryableRequest<T>(
  request: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryableRequest(request, retries - 1, delay * 2); // Exponential backoff
    }
    throw error;
  }
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      fetch: (...args) => {
        // Skip retries for auth requests
        const url = args[0]?.toString() || '';
        if (url.includes('/auth/')) {
          return fetch(...args);
        }
        return retryableRequest(() => fetch(...args));
      }
    }
  }
);

// Add connection status check with retry
export async function checkSupabaseConnection(): Promise<boolean> {
  return retryableRequest(async () => {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    return !error;
  });
}

// Handle auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    localStorage.removeItem('supabase.auth.token');
  }
});