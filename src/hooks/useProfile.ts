import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ProfileData {
  display_name: string | null;
  email: string;
  avatar_url: string | null;
  user_type: 'Admin' | 'Client';
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.user) {
          setError('No authenticated user');
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('display_name, email, avatar_url, user_type')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        setProfile(profileData);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Subscribe to profile changes
    const channel = supabase
      .channel('profile_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}` 
        }, 
        () => {
          fetchProfile();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return { profile, loading, error };
}