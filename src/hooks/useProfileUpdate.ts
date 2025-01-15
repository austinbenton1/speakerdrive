import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore, useProfileStore } from '../lib/store';

interface ProfileUpdateData {
  display_name?: string | null;
  services?: string[];
  industries?: string[];
  offering?: string | null;
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
      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: updates.display_name,
          services: updates.services,
          industries: updates.industries,
          offering: updates.offering
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Update local profile state
      updateProfileState(updates);
      setSuccess(true);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = () => setError(null);

  return {
    updateProfile: handleProfileUpdate,
    isSubmitting,
    error,
    success,
    clearError
  };
}