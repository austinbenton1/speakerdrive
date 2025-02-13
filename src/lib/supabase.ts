import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { validateEnv } from './env';

// Validate and get environment variables
const env = validateEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

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
      detectSessionInUrl: true,
      flowType: 'implicit',
      storage: window.localStorage
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

// Debug auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', { event, email: session?.user?.email });

  if (event === 'SIGNED_IN') {
    console.log('User signed in, redirecting to chat...');
    window.location.href = '/chat/conversation';
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
    localStorage.removeItem('supabase.auth.token');
    window.location.href = '/login';
  }
});