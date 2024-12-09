import { useState, useEffect } from 'react';
import { fetchLeadById } from '../lib/api/leads';
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