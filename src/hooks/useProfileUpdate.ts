import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface ProfileUpdateData {
  display_name?: string;
  services?: string[];
  industries?: string[];
}

export function useProfileUpdate() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const setUser = useAuthStore(state => state.setUser);

  const handleProfileUpdate = async (userId: string, updates: ProfileUpdateData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (updateError) throw updateError;

      // Update auth metadata for display name
      if (updates.display_name) {
        const { data: { user }, error: authError } = await supabase.auth.updateUser({
          data: { display_name: updates.display_name }
        });

        if (authError) throw authError;

        // Update global auth state to reflect the new display name
        if (user) {
          setUser(user);
        }
      }

      // Fetch the updated profile
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Send only updated fields to webhook
      try {
        const payload = {
          user: {
            id: userId,
            display_name: updatedProfile.display_name
          },
          changes: updates
        };

        await fetch('https://n8n.speakerdrive.com/webhook/supa-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } catch (webhookError) {
        console.error('Failed to send profile update to webhook:', webhookError);
        // Don't throw here - we don't want to fail the update if webhook fails
      }

      setSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    updateProfile: handleProfileUpdate,
    isSubmitting,
    error,
    success,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(false)
  };
}