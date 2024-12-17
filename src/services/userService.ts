import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types/users';

export class UserQueryError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'UserQueryError';
  }
}

export async function fetchUsers(): Promise<UserProfile[]> {
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        display_name,
        user_type,
        created_at,
        avatar_url
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new UserQueryError(
        error.message,
        error.code
      );
    }

    if (!users) {
      return [];
    }

    return users;
  } catch (error) {
    if (error instanceof UserQueryError) {
      throw error;
    }
    throw new UserQueryError(
      'Failed to fetch users',
      error instanceof Error ? error.message : undefined
    );
  }
}