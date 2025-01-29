import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types/profile';

export class ProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProfileError';
  }
}

interface ProfileUpdateResponse {
  success: boolean;
  error?: string;
}

export async function updateProfile(userId: string, updates: Partial<UserProfile>): Promise<ProfileUpdateResponse> {
  try {
    if (!userId) {
      throw new ProfileError('User ID is required');
    }

    // Prepare update data
    const updateData: Record<string, any> = {};

    // Handle display name
    if (updates.display_name !== undefined) {
      updateData.display_name = updates.display_name;
    }

    // Handle services - ensure it's stored as an array with single value
    if (updates.services !== undefined) {
      updateData.services = Array.isArray(updates.services) 
        ? [updates.services[0]] // Take first value if array
        : [updates.services]; // Wrap single value in array
    }

    // Handle website - can be null
    if ('website' in updates) {
      updateData.website = updates.website || null;
    }

    // Update profile data
    const { error: profileError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (profileError) {
      throw new ProfileError(profileError.message);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ProfileError ? error.message : 'Failed to update profile'
    };
  }
}