import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore, useProfileStore } from '../lib/store';

interface ProfileUpdateData {
  display_name?: string | null;
  services?: string | string[] | null;
  offering?: string | null;
  website?: string | null;
}

export function useProfileUpdate() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const updateProfileState = useProfileStore(state => state.updateProfile);

  const handleProfileUpdate = async (userId: string, updates: ProfileUpdateData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Convert services to string if it's an array
      const servicesString = Array.isArray(updates.services) 
        ? updates.services[0] || null 
        : typeof updates.services === 'string'
          ? updates.services
          : null;

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: updates.display_name,
          services: servicesString,
          offering: updates.offering,
          website: updates.website
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      setSuccess(true);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateLocalProfile = (updates: ProfileUpdateData) => {
    updateProfileState(updates);
  };

  const clearError = () => setError(null);

  return {
    updateProfile: handleProfileUpdate,
    updateLocalProfile,
    isSubmitting,
    error,
    success,
    clearError
  };
}