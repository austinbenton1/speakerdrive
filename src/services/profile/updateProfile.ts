import { supabase } from '../../lib/supabase';
import { ProfileError } from './errors';
import type { ProfileUpdateData, ProfileResponse } from './types';

interface UpdateProfileData {
  display_name?: string | null;
  services?: string[];
  industries?: string[];
  offering?: string | null;
}

export async function updateProfile(
  profileId: string, 
  data: UpdateProfileData
): Promise<ProfileResponse> {
  try {
    // Update profile data in profiles table
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: data.display_name,
        services: data.services,
        industries: data.industries,
        offering: data.offering,
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId);

    if (error) throw new ProfileError(error.message);

    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      error: error instanceof ProfileError ? error.message : 'Failed to update profile'
    };
  }
}