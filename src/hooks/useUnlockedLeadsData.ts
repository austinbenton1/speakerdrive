import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { RecordedLead, LeadQueryResult } from '../types/leads';

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
              lead_name,
              focus,
              industry,
              lead_type,
              unlock_type,
              organization,
              event_name
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        // Transform the data to flatten the structure
        const transformedLeads = (data as LeadQueryResult[])?.map(item => ({
          lead_id: item.lead_id,
          lead_name: item.leads.lead_name,
          focus: item.leads.focus,
          industry: item.leads.industry,
          lead_type: item.leads.lead_type,
          unlock_type: item.leads.unlock_type,
          organization: item.leads.organization,
          event_name: item.leads.event_name,
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