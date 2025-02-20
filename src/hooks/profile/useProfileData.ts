import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { fetchProfileData } from '../../services/profile/queries';
import type { UserProfile } from '../../types/profile';

const mapProfileData = (userId: string, profileData: any): UserProfile => ({
  id: userId,
  name: profileData.display_name || '',
  display_name: profileData.display_name,
  email: profileData.email,
  services: profileData.services,
  avatarUrl: profileData.avatar_url,
  quick_start_guide_tip: profileData.quick_start_guide_tip ?? true,
  offering: profileData.offering,
  random_lead_sort: profileData.random_lead_sort,
  random_lead_sort_date: profileData.random_lead_sort_date,
  website: profileData.website,
  is_onboarding: profileData.is_onboarding
});

export function useProfileData() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define loadProfile as a useCallback to avoid recreating it unnecessarily
  const loadProfile = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) {
        setError('No authenticated user');
        return;
      }

      const profileData = await fetchProfileData(session.user.id);
      setProfile(mapProfileData(session.user.id, profileData));
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed as all used values are from closure scope

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: updates.display_name,
          services: updates.services,
          offering: updates.offering,
          random_lead_sort: updates.random_lead_sort,
          random_lead_sort_date: updates.random_lead_sort_date
        })
        .eq('id', profile?.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return { success: true };
    } catch (err) {
      console.error('Error updating profile:', err);
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