import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recordLeadVisit } from '../lib/api/leadVisits';
import { LeadVisitError, AuthenticationError } from '../lib/api/errors';
import type { LeadVisit } from '../types/visits';

interface UseLeadVisitResult {
  visitLead: (leadId: string) => Promise<void>;
  isRecording: boolean;
  error: Error | null;
  lastVisit: LeadVisit | null;
}

export function useLeadVisit(): UseLeadVisitResult {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastVisit, setLastVisit] = useState<LeadVisit | null>(null);

  const visitLead = async (leadId: string) => {
    try {
      setIsRecording(true);
      setError(null);
      
      const visit = await recordLeadVisit(leadId);
      setLastVisit(visit);
      
      navigate(`/leads/${leadId}`);
    } catch (err) {
      let error: Error;
      
      if (err instanceof LeadVisitError || err instanceof AuthenticationError) {
        error = err;
      } else {
        error = new Error('Failed to record lead visit');
      }
      
      setError(error);
      // console.error('Lead visit error:', error);
      
      // Still navigate even if recording fails
      navigate(`/leads/${leadId}`);
    } finally {
      setIsRecording(false);
    }
  };

  return {
    visitLead,
    isRecording,
    error,
    lastVisit
  };
}