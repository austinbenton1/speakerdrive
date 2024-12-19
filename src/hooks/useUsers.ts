import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUsers, UserQueryError } from '../services/userService';
import type { UserProfile } from '../types/users';
import { supabase } from '../lib/supabase';

export function useUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    const getAuthUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthUserId(user?.id || null);
    };
    getAuthUser();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await fetchUsers();
      // Filter out the authenticated user
      const filteredUsers = authUserId 
        ? fetchedUsers.filter(user => user.id !== authUserId)
        : fetchedUsers;
      setUsers(filteredUsers);
      setError(null);
    } catch (err) {
      console.error('Error loading users:', err);
      if (err instanceof UserQueryError) {
        setError(err.message);
      } else {
        setError('Failed to load users. Please try again.');
      }
      
      // If unauthorized, redirect to login
      if (err instanceof UserQueryError && err.code === 'PGRST301') {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reload users when authUserId changes
  useEffect(() => {
    loadUsers();
  }, [navigate, authUserId]);

  return { users, loading, error, refreshUsers: loadUsers };
}