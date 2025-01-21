import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/profile';

export interface UserProfile extends Omit<Profile, 'avatar_url'> {
  display_name: string | null;
  avatarUrl: string | null;
  services: string;
  quick_start_guide_tip: boolean | null;
  offering: string | null;
  random_lead_sort: boolean | null;
  random_lead_sort_date: string | null;
  website: string | null;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const parseServices = (services: any): string | null => {
    if (!services) return null;

    // If it's already a string but not JSON, return as is
    if (typeof services === 'string') {
      return services;
    }

    // If it's an array, take the first item
    if (Array.isArray(services)) {
      return services[0] || null;
    }

    return null;
  };

  const loadProfile = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        throw new Error('Failed to get session: ' + sessionError.message);
      }
      
      if (!session?.user) {
        setError(new Error('No authenticated user'));
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          display_name,
          avatar_url,
          user_type,
          services,
          industries,
          quick_start_guide_tip,
          offering,
          random_lead_sort,
          random_lead_sort_date,
          website
        `)
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        throw new Error('Failed to fetch profile: ' + profileError.message);
      }

      if (!profileData) {
        throw new Error('Profile not found');
      }

      const parsedServices = parseServices(profileData.services);

      setProfile({
        id: session.user.id,
        name: session.user.user_metadata?.name || '',
        display_name: profileData.display_name,
        email: session.user.email || '',
        avatarUrl: profileData.avatar_url,
        services: parsedServices || '',
        quick_start_guide_tip: profileData.quick_start_guide_tip ?? true,
        offering: profileData.offering,
        random_lead_sort: profileData.random_lead_sort,
        random_lead_sort_date: profileData.random_lead_sort_date,
        website: profileData.website
      });
      setError(null);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to load profile'));
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!profile?.id) {
        return { success: false, error: 'No profile ID available' };
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile?.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return { success: false, error: updateError.message };
      }

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      return { success: false, error: 'Failed to update profile' };
    }
  };

  return {
    profile,
    loading,
    error,
    refetch: loadProfile,
    updateProfile
  };
}