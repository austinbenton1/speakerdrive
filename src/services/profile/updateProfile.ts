import { supabase } from '../../lib/supabase';
import { ProfileError } from './errors';
import type { ProfileUpdateData, ProfileResponse } from './types';

export async function updateProfile(
  userId: string, 
  updates: ProfileUpdateData
): Promise<ProfileResponse> {
  try {
    // Update profile data in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        display_name: updates.display_name
      })
      .eq('id', userId);

    if (profileError) throw new ProfileError(profileError.message);

    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      error: error instanceof ProfileError ? error.message : 'Failed to update profile'
    };
  }
}