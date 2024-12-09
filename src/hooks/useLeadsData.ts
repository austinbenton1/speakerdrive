import { useEffect, useState } from 'react';
import { supabase, fetchWithRetry } from '../lib/supabase';

export interface Lead {
  id: string;
  image_url: string;
  lead_name: string;
  focus: string;
  lead_type: 'Event' | 'Contact';
  unlock_type: 'Contact Email' | 'Event Email' | 'Event URL';
  industry: string;
  domain_type: string;
  organization: string;
  event_info: string;
}

export function useLeadsData() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data, error: fetchError } = await fetchWithRetry(async () => {
          return await supabase
            .from('leads')
            .select('*');
        });

        if (fetchError) throw fetchError;
        setLeads(data || []);
      } catch (err) {
        console.error('Error fetching leads:', err);
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
          // Refresh the leads data when changes occur
          fetchLeads();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { leads, loading, error };
}