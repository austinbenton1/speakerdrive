import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { fetchProfileData } from '../../services/profile/queries';
import type { UserProfile } from '../../types/profile';

export function useProfileData() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.user) {
          setError('No authenticated user');
          return;
        }

        const profileData = await fetchProfileData(session.user.id);

        setProfile({
          id: session.user.id,
          name: profileData.display_name || '',
          display_name: profileData.display_name,
          email: profileData.email,
          services: profileData.services,
          industries: profileData.industries,
          avatarUrl: profileData.avatar_url
        });
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  return { profile, loading, error, refetch: loadProfile };
}