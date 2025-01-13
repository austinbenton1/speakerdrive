import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Lead } from '../types';

interface UseLeadNavigationProps {
  currentLeadId: string;
  leads: Lead[];
  searchParams: URLSearchParams;
}

interface LeadNavigation {
  hasPrevious: boolean;
  hasNext: boolean;
  navigateToPrevious: () => void;
  navigateToNext: () => void;
  previousLead?: Lead;
  nextLead?: Lead;
}

export function useLeadNavigation({
  currentLeadId,
  leads,
  searchParams
}: UseLeadNavigationProps): LeadNavigation {
  const navigate = useNavigate();

  // Find current lead index
  const currentIndex = leads.findIndex(lead => lead.id === currentLeadId);

  // Determine if we have previous/next leads
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < leads.length - 1;

  // Get previous and next leads if they exist
  const previousLead = hasPrevious ? leads[currentIndex - 1] : undefined;
  const nextLead = hasNext ? leads[currentIndex + 1] : undefined;

  // Navigation functions
  const navigateToPrevious = useCallback(() => {
    if (hasPrevious && previousLead) {
      navigate(`/leads/${previousLead.id}?${searchParams.toString()}`);
    }
  }, [hasPrevious, previousLead, navigate, searchParams]);

  const navigateToNext = useCallback(() => {
    if (hasNext && nextLead) {
      navigate(`/leads/${nextLead.id}?${searchParams.toString()}`);
    }
  }, [hasNext, nextLead, navigate, searchParams]);

  return {
    hasPrevious,
    hasNext,
    navigateToPrevious,
    navigateToNext,
    previousLead,
    nextLead
  };
}
