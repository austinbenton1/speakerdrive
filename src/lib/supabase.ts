import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { validateEnv } from './env';

const env = validateEnv();

export const supabase = createClient<Database>(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY,
  {
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
    }
  }
);

supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    localStorage.removeItem('supabase.auth.token');
  }
});