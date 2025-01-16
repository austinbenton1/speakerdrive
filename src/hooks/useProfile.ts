import { useState, useEffect } from 'react';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string;
  avatar_url: string | null;
  user_type: 'Admin' | 'Client';
  services: string[];
  industries: string[];
}

// Placeholder profile data
const placeholderProfile: Profile = {
  id: '1',
  user_id: '1',
  display_name: 'John Doe',
  email: 'john@example.com',
  avatar_url: null,
  user_type: 'Client',
  services: ['Keynote Speaker', 'Workshop Leader'],
  industries: ['Technology', 'Education']
};

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulated fetch profile function
  const fetchProfile = () => {
    // Simulate API delay
    setTimeout(() => {
      setProfile(placeholderProfile);
      setError(null);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { 
    profile, 
    loading, 
    error,
    refetch: fetchProfile
  };
}