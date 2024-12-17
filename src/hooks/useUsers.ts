import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUsers, UserQueryError } from '../services/userService';
import type { UserProfile } from '../types/users';

export function useUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const fetchedUsers = await fetchUsers();
        setUsers(fetchedUsers);
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

    loadUsers();
  }, [navigate]);

  return { users, loading, error };
}