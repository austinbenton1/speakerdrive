import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string;
  avatar_url: string | null;
  user_type: 'Admin' | 'Client';
  services: string;
  is_onboarding: boolean | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseServices = (services: any): string | null => {
    if (!services) return null;

    // If it's already a string but looks like a JSON array
    if (typeof services === 'string' && services.startsWith('[') && services.endsWith(']')) {
      try {
        // Parse the JSON string and get the first item
        const parsed = JSON.parse(services);
        if (Array.isArray(parsed)) {
          return parsed[0] || null;
        }
      } catch (e) {
        return null;
      }
    }

    // If it's already a string but not JSON, return as is
    if (typeof services === 'string') {
      return services;
    }

    // If it's an array, take the first item
    if (Array.isArray(services)) {
      return services[0] || null;
    }

    return null;
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
  
      // Get session directly from Supabase
      const { data: { session } } = await supabase.auth.getSession();
  
      if (!session?.user?.id) {
        console.log('No session user ID found');
        setProfile(null);
        return;
      }
  
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
  
      if (fetchError) throw fetchError;
      
      const parsedServices = parseServices(data.services);
      const parsedData = {
        ...data,
        services: parsedServices
      };
      
      setProfile(parsedData);
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setProfile(null);
          } else {
            const parsedServices = parseServices(payload.new.services);
            
            // Parse services from any format
            const newData = {
              ...payload.new,
              services: parsedServices
            };
            setProfile(newData as Profile);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  return { 
    profile, 
    loading, 
    error,
    refetch: fetchProfile
  };
}