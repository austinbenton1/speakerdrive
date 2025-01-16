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

    // If it's already a string but looks like a JSON array
    if (typeof services === 'string' && services.startsWith('[') && services.endsWith(']')) {
      try {
        // Parse the JSON string and get the first item
        const parsed = JSON.parse(services);
        if (Array.isArray(parsed)) {
          return parsed[0] || null;
        }
      } catch (e) {
        return null;
      }
    }

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
      if (sessionError) throw sessionError;
      
      if (!session?.user) {
        setProfile(null);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;

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
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load profile'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile?.id);

      if (updateError) throw updateError;

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