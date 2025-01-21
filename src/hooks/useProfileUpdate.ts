import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore, useProfileStore } from '../lib/store';

interface ProfileUpdateData {
  display_name?: string | null;
  services?: string | string[] | null;
  offering?: string | null;
  website?: string | null;
  industries?: string | string[] | null;
}

export function useProfileUpdate() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateProfileState = useProfileStore(state => state.updateProfile);
  const { user } = useAuthStore();

  const handleProfileUpdate = async (userId: string, updates: ProfileUpdateData) => {
    try {
      setIsSubmitting(true);
      setError(null);

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
          id: userId,
          display_name: updates.display_name,
          services: servicesString,
          offering: updates.offering,
          website: updates.website
        })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      // Prepare changes object with only updated fields
      const changes: Record<string, any> = {};
      
      if (updates.display_name !== undefined) {
        changes.display_name = updates.display_name;
      }
      
      if (updates.services !== undefined) {
        changes.services = servicesString;
      }

      if (updates.offering !== undefined) {
        changes.offering = updates.offering;
      }

      if (updates.website !== undefined) {
        changes.website = updates.website;
      }

      // Only send webhook if there are actual changes
      if (Object.keys(changes).length > 0) {
        const webhookPayload = {
          user: {
            id: userId,
            display_name: updates.display_name || null
          },
          changes
        };

        // Fire and forget webhook
        fetch('https://n8n.speakerdrive.com/webhook/supa-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload)
        }).catch(err => {
          console.error('Webhook error:', err);
        });
      }

      // Update local state
      updateProfileState({
        display_name: updates.display_name,
        services: servicesString,
        offering: updates.offering,
        website: updates.website
      });

      return { success: true };
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update profile'
      };
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
    clearError
  };
}