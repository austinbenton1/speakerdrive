import { supabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';

interface LinkedInProfileData {
  name?: string;
  headline?: string;  // This contains the job/role
  company?: string;
  profilePicture?: string;
}

export async function updateProfileWithLinkedInData(user: User) {
  try {
    if (!user.user_metadata) {
      throw new Error('No user metadata available');
    }

    // First update with basic metadata
    const basicUpdate = {
      display_name: user.user_metadata.name,
      avatar_url: user.user_metadata.picture,
      updated_at: new Date().toISOString()
    };

    // If we have a provider token, fetch additional data from LinkedIn
    if (user.app_metadata?.provider === 'linkedin_oidc') {
      try {
        const { data: linkedInData, error } = await supabase.functions.invoke('linkedin-profile', {
          body: { accessToken: user.app_metadata.provider_token }
        });

        if (!error && linkedInData) {
          // Merge LinkedIn data with basic update
          Object.assign(basicUpdate, {
            company_role: linkedInData.headline,
            company: linkedInData.company
          });
        }
      } catch (error) {
        console.error('Error fetching additional LinkedIn data:', error);
        // Continue with basic update even if LinkedIn API call fails
      }
    }

    // Update profile in Supabase
    const { error } = await supabase
      .from('profiles')
      .update(basicUpdate)
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

export async function getLinkedInProfileData(accessToken: string): Promise<LinkedInProfileData> {
  try {
    const { data, error } = await supabase.functions.invoke('linkedin-profile', {
      body: { accessToken }
    });

    if (error) throw error;
    return data as LinkedInProfileData;
  } catch (error) {
    console.error('Error fetching LinkedIn profile data:', error);
    throw error;
  }
}
