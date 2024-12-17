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

    // Handle services array
    if (updates.services !== undefined) {
      updateData.services = Array.isArray(updates.services) ? updates.services : [];
    }

    // Handle industries array
    if (updates.industries !== undefined) {
      updateData.industries = Array.isArray(updates.industries) ? updates.industries : [];
    }

    // Update profile data
    const { error: profileError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
      throw new ProfileError(profileError.message);
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      error: error instanceof ProfileError ? error.message : 'Failed to update profile'
    };
  }
}