import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { RecordedLead } from '../types/leads';

// Check interval in milliseconds (3 minutes)
const CHECK_INTERVAL = 3 * 60 * 1000;

export function useUnlockedLeadsData() {
  const { user, isAuthenticated } = useAuth();
  const [recordedLeads, setRecordedLeads] = useState<RecordedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unlockedLeadIdsRef = useRef<string[]>([]);
  const checkIntervalRef = useRef<NodeJS.Timeout>();

  const fetchUnlockedLeads = useCallback(async (userId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('unlocked_leads')
        .select(`
          lead_id,
          unlocked_at:created_at,
          unlocked,
          leads:lead_id!inner (
            event_name,
            focus,
            industry,
            lead_type,
            subtext,
            image_url,
            unlock_value,
            related_leads
          )
        `)
        .eq('user_id', userId)
        .eq('unlocked', true)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Debug logging
      console.log('Raw data from Supabase:', data);

      // Extract lead IDs from the new data
      const newLeadIds = (data || []).map(item => item.lead_id);

      // Check if the list of lead IDs has changed
      const hasChanges = JSON.stringify(newLeadIds.sort()) !== JSON.stringify(unlockedLeadIdsRef.current.sort());

      if (hasChanges) {
        // Update the stored lead IDs
        unlockedLeadIdsRef.current = newLeadIds;

        // Transform and update the recorded leads
        const transformedLeads = (data as any[])?.map(item => ({
          lead_id: item.lead_id,
          event_name: item.leads.event_name,
          focus: item.leads.focus,
          industry: item.leads.industry,
          lead_type: item.leads.lead_type,
          subtext: item.leads.subtext,
          image_url: item.leads.image_url,
          unlocked_at: item.unlocked_at,
          unlocked: item.unlocked,
          related_leads: item.leads.related_leads
        })) || [];

        console.log('Transformed leads:', transformedLeads);

        setRecordedLeads(transformedLeads);
      }
    } catch (err) {
      console.error('Error fetching unlocked leads:', err);
      setError('Failed to load unlocked leads');
      setRecordedLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up periodic checking
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setRecordedLeads([]);
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchUnlockedLeads(user.id);

    // Set up interval for periodic checking
    checkIntervalRef.current = setInterval(() => {
      fetchUnlockedLeads(user.id);
    }, CHECK_INTERVAL);

    // Cleanup
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isAuthenticated, user, fetchUnlockedLeads]);

  return { 
    recordedLeads, 
    loading, 
    error,
    unlockedLeadIds: unlockedLeadIdsRef.current 
  };
}