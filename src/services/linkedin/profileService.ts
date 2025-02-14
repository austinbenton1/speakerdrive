import { supabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';

export async function updateProfileWithLinkedInData(user: User) {
  try {
    if (!user.user_metadata) {
      throw new Error('No user metadata available');
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: user.user_metadata.name,
        avatar_url: user.user_metadata.picture,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating profile with LinkedIn data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile'
    };
  }
}
