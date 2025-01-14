import { useState, useEffect } from 'react';
import { fetchLeadById } from '../lib/api/leads';
import type { SpeakerLead } from '../types';
import { User } from '@supabase/supabase-js';

interface UseLeadDetailsResult {
  lead: SpeakerLead | null;
  isLoading: boolean;
  error: Error | null;
}

export function useLeadDetails(id: string, user: User | null): UseLeadDetailsResult {
  const [lead, setLead] = useState<SpeakerLead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadLead() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
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
  }, [id, user]);

  return { lead, isLoading, error };
}