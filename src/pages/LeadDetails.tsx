import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Loader, X } from 'lucide-react';
import { useLeadDetails } from '../hooks/useLeadDetails';
import { useLeadUnlock } from '../hooks/useLeadUnlock';
import LeadDetailHeader from '../components/leads/LeadDetailHeader';
import LeadDetailContent from '../components/leads/LeadDetailContent';
import LeadDetailSidebar from '../components/leads/LeadDetailSidebar';

interface LocationState {
  leadIds: string[];
  currentIndex: number;
  fromFindLeads: boolean;
}

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const { lead, isLoading, error } = useLeadDetails(id || '');
  const { 
    isUnlocked,
    isUnlocking,
    unlockValue,
    error: unlockError,
    handleUnlock,
    checkUnlockStatus
  } = useLeadUnlock(id || '');

  useEffect(() => {
    if (id) {
      checkUnlockStatus();
    }
  }, [id]);

  const handlePrevious = () => {
    if (state?.leadIds && state.currentIndex > 0) {
      const previousId = state.leadIds[state.currentIndex - 1];
      navigate(`/leads/${previousId}${location.search}`, {
        state: {
          ...state,
          currentIndex: state.currentIndex - 1
        }
      });
    }
  };

  const handleNext = () => {
    if (state?.leadIds && state.currentIndex < state.leadIds.length - 1) {
      const nextId = state.leadIds[state.currentIndex + 1];
      navigate(`/leads/${nextId}${location.search}`, {
        state: {
          ...state,
          currentIndex: state.currentIndex + 1
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#EDEEF0' }}>
        <div className="flex flex-col items-center">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="mt-2 text-sm text-gray-600">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#EDEEF0' }}>
        <div className="text-center">
          <p className="text-red-600">Error loading lead details. Please try again.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const hasPrevious = state?.leadIds && state.currentIndex > 0;
  const hasNext = state?.leadIds && state.currentIndex < state.leadIds.length - 1;

  return (
    <div className="min-h-screen" style={{ background: '#EDEEF0' }}>
      <LeadDetailHeader
        lead={lead}
        onUnlock={handleUnlock}
        isUnlocking={isUnlocking}
        isUnlocked={isUnlocked}
        unlockValue={unlockValue}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="flex-1">
            <LeadDetailContent lead={lead} />
          </div>
          <div className="w-80">
            <LeadDetailSidebar lead={lead} />
          </div>
        </div>
      </div>
    </div>
  );
}