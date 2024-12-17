import { useCallback } from 'react';

export function useUserActions() {
  const handleAddUser = useCallback(() => {
    console.log('Add user');
    // Implement add user functionality
  }, []);

  const handleEditUser = useCallback((userId: string) => {
    console.log('Edit user:', userId);
    // Implement edit functionality
  }, []);

  const handleDeleteUser = useCallback((userId: string) => {
    console.log('Delete user:', userId);
    // Implement delete functionality
  }, []);

  return {
    handleAddUser,
    handleEditUser,
    handleDeleteUser
  };
}