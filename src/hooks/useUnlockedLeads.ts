import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { UnlockedLead } from '../types';

export function useUnlockedLeads() {
  const [leads, setLeads] = useState<UnlockedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnlockedLeads = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setError('No authenticated user');
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('unlocked_leads')
          .select(`
            id,
            created_at,
            lead_id,
            leads!inner (
              lead_name,
              focus,
              industry,
              image_url
            )
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        const formattedLeads = data?.map(item => ({
          id: item.lead_id,
          name: item.leads.lead_name,
          focus: item.leads.focus,
          industry: item.leads.industry,
          image: item.leads.image_url,
          unlockDate: new Date(item.created_at),
        })) || [];

        setLeads(formattedLeads);
      } catch (err) {
        console.error('Error fetching unlocked leads:', err);
        setError('Failed to load unlocked leads');
      } finally {
        setLoading(false);
      }
    };

    fetchUnlockedLeads();
  }, []);

  return { leads, loading, error };
}