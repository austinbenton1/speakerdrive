import { supabase } from '../../lib/supabase';
import { ProfileError } from './errors';
import type { ProfileUpdateData, ProfileResponse } from './types';

export async function updateProfileData(
  userId: string, 
  updates: ProfileUpdateData
): Promise<ProfileResponse> {
  try {
    if (!userId) {
      throw new ProfileError('User ID is required');
    }

    // Ensure arrays are properly formatted
    const updateData: Record<string, any> = {
      display_name: updates.display_name
    };

    if (updates.services) {
      updateData.services = Array.isArray(updates.services) ? updates.services : [];
    }

    if (updates.industries) {
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