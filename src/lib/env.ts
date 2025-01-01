import { supabase } from './supabase';

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export function validateEnvVars() {
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate Supabase URL format
  try {
    new URL(import.meta.env.VITE_SUPABASE_URL);
  } catch (error) {
    throw new Error('Invalid VITE_SUPABASE_URL format. Must be a valid URL.');
  }
}