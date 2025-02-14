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
        company_role: user.user_metadata.headline || null,
        company: user.user_metadata.company || null
      })
      .eq('id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    throw new Error('Failed to update profile with LinkedIn data');
  }
}
