import { supabase } from '../../lib/supabase';

interface LinkedInProfileData {
  name?: string;
  headline?: string;  // This contains the job/role
  company?: string;
  profilePicture?: string;
}

export async function updateProfileWithLinkedInData(userId: string, linkedInData: LinkedInProfileData) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: linkedInData.name,
        company_role: linkedInData.headline,
        company: linkedInData.company,
        avatar_url: linkedInData.profilePicture,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

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
    // Fetch basic profile information
    const response = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch LinkedIn profile data');
    }

    const data = await response.json();
    
    // Fetch profile picture
    const pictureResponse = await fetch('https://api.linkedin.com/v2/me?projection=(profilePicture(displayImage~:playableStreams))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    const pictureData = await pictureResponse.json();
    const profilePicture = pictureData?.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier;

    return {
      name: `${data.localizedFirstName} ${data.localizedLastName}`,
      headline: data.headline,
      company: data.positions?.values?.[0]?.company?.name,
      profilePicture
    };
  } catch (error) {
    console.error('Error fetching LinkedIn profile data:', error);
    throw error;
  }
}
