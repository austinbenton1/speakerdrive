import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types/profile';

export function useUserProfile() {
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

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        // Parse services and industries from the database
        // They might be stored as JSON strings, arrays, or null
        let parsedServices: string[] = [];
        let parsedIndustries: string[] = [];

        try {
          if (profileData.services) {
            parsedServices = typeof profileData.services === 'string' 
              ? JSON.parse(profileData.services)
              : Array.isArray(profileData.services) 
                ? profileData.services 
                : [];
          }

          if (profileData.industries) {
            parsedIndustries = typeof profileData.industries === 'string'
              ? JSON.parse(profileData.industries)
              : Array.isArray(profileData.industries)
                ? profileData.industries
                : [];
          }
        } catch (parseError) {
          console.error('Error parsing services/industries:', parseError);
        }

        setProfile({
          id: session.user.id,
          name: profileData.display_name || '',
          display_name: profileData.display_name,
          email: profileData.email,
          services: parsedServices,
          industries: parsedIndustries,
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

  return { profile, loading, error };
}