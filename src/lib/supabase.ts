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

// Function to sync LinkedIn profile data
async function syncLinkedInProfile(session: any) {
  if (!session?.user?.user_metadata) return;

  const metadata = session.user.user_metadata;
  const userId = session.user.id;

  // Extract LinkedIn data
  const profileData = {
    display_name: metadata.full_name || metadata.name,
    avatar_url: metadata.avatar_url || metadata.picture,
    email: metadata.email,
    company: metadata.custom_claims?.company || metadata.company,
    company_role: metadata.custom_claims?.title || metadata.job_title || metadata.position
  };

  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...profileData
      }, {
        onConflict: 'id'
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error syncing LinkedIn profile:', error);
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

// Handle auth state changes
supabase.auth.onAuthStateChange(async (event, session) => {
  // Sync LinkedIn profile data on sign in
  if (event === 'SIGNED_IN' && session?.provider_token) {
    await syncLinkedInProfile(session);
  }

  // Handle redirects
  if (event === 'SIGNED_IN' && window.location.pathname === '/login') {
    window.location.href = '/dashboard';
  } else if (event === 'SIGNED_OUT' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
});