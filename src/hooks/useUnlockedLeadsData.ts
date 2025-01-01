import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { RecordedLead } from '../types/leads';

export function useUnlockedLeadsData() {
  const [recordedLeads, setRecordedLeads] = useState<RecordedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnlockedLeads = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('No authenticated user');

        const { data, error: fetchError } = await supabase
          .from('unlocked_leads')
          .select(`
            lead_id,
            unlocked_at:created_at,
            unlocked,
            leads (
              event_name,
              focus,
              industry,
              lead_type,
              subtext,
              image_url
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        const transformedLeads = (data as any[])?.map(item => ({
          lead_id: item.lead_id,
          event_name: item.leads.event_name,
          focus: item.leads.focus,
          industry: item.leads.industry,
          lead_type: item.leads.lead_type,
          subtext: item.leads.subtext,
          image_url: item.leads.image_url,
          unlocked_at: item.unlocked_at,
          unlocked: item.unlocked
        })) || [];

        setRecordedLeads(transformedLeads);
      } catch (err) {
        console.error('Error fetching unlocked leads:', err);
        setError('Failed to load unlocked leads');
      } finally {
        setLoading(false);
      }
    };

    fetchUnlockedLeads();
  }, []);

  return { recordedLeads, loading, error };
}