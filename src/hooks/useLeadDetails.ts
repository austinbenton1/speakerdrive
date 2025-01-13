import { useState, useEffect } from 'react';
import { fetchLeadById } from '../lib/api/leads';
import { supabase } from '../lib/supabase';
import type { SpeakerLead } from '../types';

interface UseLeadDetailsResult {
  lead: SpeakerLead | null;
  isLoading: boolean;
  error: Error | null;
}

export function useLeadDetails(id: string): UseLeadDetailsResult {
  const [lead, setLead] = useState<SpeakerLead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadLead() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('No authenticated user');

        // Record the visit in unlocked_leads
        const { error: visitError } = await supabase
          .from('unlocked_leads')
          .upsert(
            {
              lead_id: id,
              user_id: user.id,
              created_at: new Date().toISOString(),
              unlocked: false
            },
            {
              onConflict: 'lead_id,user_id',
              ignoreDuplicates: true
            }
          );

        if (visitError) {
          console.error('Error recording lead visit:', visitError);
        }
        
        const leadData = await fetchLeadById(id);
        setLead(leadData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch lead details'));
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadLead();
    }
  }, [id]);

  return { lead, isLoading, error };
}