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
    // First, get all users with their basic info
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        display_name,
        user_type,
        created_at,
        avatar_url,
        banned,
        banned_at,
        banned_by
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

    // Get the banned_by display names for banned users
    const bannedUsers = users.filter(user => user.banned && user.banned_by);
    const bannerIds = [...new Set(bannedUsers.map(user => user.banned_by).filter(Boolean))];
    
    if (bannerIds.length > 0) {
      const { data: banners, error: bannersError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', bannerIds as string[]);

      if (bannersError) {
        throw new UserQueryError(
          bannersError.message,
          bannersError.code
        );
      }

      // Create a map of banner IDs to display names
      const bannerMap = new Map(
        banners?.map(banner => [banner.id, banner.display_name]) || []
      );

      // Add banner display names to the users
      return users.map(user => ({
        ...user,
        banned_by_display_name: user.banned_by ? bannerMap.get(user.banned_by) || null : null
      }));
    }

    return users.map(user => ({
      ...user,
      banned_by_display_name: null
    }));
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

export async function banUser(userId: string, bannedById: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        banned_at: new Date().toISOString(),
        banned: true,
        banned_by: bannedById
      })
      .eq('id', userId);

    if (error) {
      throw new UserQueryError(
        error.message,
        error.code
      );
    }
  } catch (error) {
    if (error instanceof UserQueryError) {
      throw error;
    }
    throw new UserQueryError(
      'Failed to ban user',
      error instanceof Error ? error.message : undefined
    );
  }
}

export async function unbanUser(userId: string, unbanById: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        banned: false,
        banned_at: new Date().toISOString(),
        banned_by: unbanById
      })
      .eq('id', userId);

    if (error) {
      throw new UserQueryError(
        error.message,
        error.code
      );
    }
  } catch (error) {
    if (error instanceof UserQueryError) {
      throw error;
    }
    throw new UserQueryError(
      'Failed to unban user',
      error instanceof Error ? error.message : undefined
    );
  }
}

export async function checkUserBanStatus(userId: string): Promise<{ isBanned: boolean; bannedAt?: string }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('banned, banned_at')
      .eq('id', userId)
      .single();

    if (error) {
      throw new UserQueryError(
        error.message,
        error.code
      );
    }

    return {
      isBanned: data?.banned || false,
      bannedAt: data?.banned_at
    };
  } catch (error) {
    if (error instanceof UserQueryError) {
      throw error;
    }
    throw new UserQueryError(
      'Failed to check user ban status',
      error instanceof Error ? error.message : undefined
    );
  }
}