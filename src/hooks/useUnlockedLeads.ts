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
            pitch,
            leads!inner (
              event_name,
              subtext,
              industry,
              image_url,
              unlock_type,
              keywords,
              unlock_value,
              focus,
              related_leads,
              lead_name,
              job_title
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
          lead_type: item.leads.unlock_type,
          keywords: item.leads.keywords,
          unlock_value: item.leads.unlock_value,
          focus: item.leads.focus,
          related_leads: item.leads.related_leads,
          pitch: item.pitch,
          lead_name: item.leads.lead_name,
          job_title: item.leads.job_title
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