import { supabase } from '../../lib/supabase';
import { ProfileError } from './errors';
import type { UserProfile } from '../../types/profile';

export async function fetchProfileData(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        display_name,
        services,
        industries,
        avatar_url
      `)
      .eq('id', userId)
      .single();

    if (error) throw new ProfileError(error.message);
    if (!data) throw new ProfileError('Profile not found');

    // Ensure services and industries are arrays
    return {
      ...data,
      services: Array.isArray(data.services) ? data.services : [],
      industries: Array.isArray(data.industries) ? data.industries : []
    };
  } catch (error) {
    console.error('Error fetching profile data:', error);
    throw error;
  }
}