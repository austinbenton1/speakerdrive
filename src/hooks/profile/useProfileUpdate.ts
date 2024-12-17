import { useState } from 'react';
import { updateProfile } from '../../services/profile';
import type { ProfileUpdateData } from '../../services/profile/types';

export function useProfileUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProfileUpdate = async (userId: string, updates: ProfileUpdateData) => {
    try {
      setIsUpdating(true);
      setError(null);

      const { success, error: updateError } = await updateProfile(userId, updates);

      if (!success && updateError) {
        setError(updateError);
        throw new Error(updateError);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateProfile: handleProfileUpdate,
    isUpdating,
    error
  };
}