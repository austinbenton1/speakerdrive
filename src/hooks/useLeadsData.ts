import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Lead } from '../types';

export function useLeadsData() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('leads')
          .select('*');

        if (fetchError) throw fetchError;
        setLeads(data || []);
      } catch (err) {
        // console.error('Error fetching leads:', err);
        setError('Failed to load leads data. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('leads_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'leads' 
        }, 
        (payload) => {
          // Update the local leads data when changes occur
          fetchLeads();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { leads, loading, error };
}