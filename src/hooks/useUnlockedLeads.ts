import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { UnlockedLead } from '../types/unlocks';

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
            lead_id,
            created_at,
            leads!inner (
              event_name,
              subtext,
              industry,
              image_url,
              lead_type,
              keywords
            )
          `)
          .eq('user_id', session.user.id)
          .eq('unlocked', true)
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('Error fetching unlocked leads:', fetchError);
          throw new Error('Failed to fetch unlocked leads');
        }

        const formattedLeads = data?.map(item => ({
          id: item.lead_id,
          event_name: item.leads.event_name,
          subtext: item.leads.subtext,
          industry: item.leads.industry,
          image: item.leads.image_url,
          unlockDate: new Date(item.created_at),
          lead_type: item.leads.lead_type,
          keywords: item.leads.keywords
        })) || [];

        setLeads(formattedLeads);
        setError(null);
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