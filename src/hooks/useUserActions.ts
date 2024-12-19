import { useCallback } from 'react';
import { banUser, unbanUser } from '../services/userService';
import { supabase } from '../lib/supabase';

export function useUserActions() {
  const handleAddUser = useCallback(() => {
    console.log('Add user');
    // Implement add user functionality
  }, []);

  const handleBanUser = useCallback(async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }
      await banUser(userId, user.id);
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  }, []);

  const handleUnbanUser = useCallback(async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }
      await unbanUser(userId, user.id);
    } catch (error) {
      console.error('Error unbanning user:', error);
      throw error;
    }
  }, []);

  return {
    handleAddUser,
    handleBanUser,
    handleUnbanUser
  };
}