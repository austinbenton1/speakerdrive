import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useLeadDetails } from '../hooks/useLeadDetails';
import { useLeadUnlock } from '../hooks/useLeadUnlock';
import LeadDetailHeader from '../components/leads/LeadDetailHeader';
import LeadDetailContent from '../components/leads/LeadDetailContent';
import LeadDetailSidebar from '../components/leads/LeadDetailSidebar';
import { supabase } from '../lib/supabase';
import { AuthContext } from '../contexts/AuthContext';
import { User } from '@supabase/supabase-js';

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
  
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Single auth check
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('No authenticated user');
        setUser(user);
      } catch (err) {
        setAuthError(err instanceof Error ? err : new Error('Authentication failed'));
      } finally {
        setIsAuthLoading(false);
      }
    }
    checkAuth();
  }, []);

  const { lead, isLoading: isLeadLoading, error: leadError } = useLeadDetails(id || '', user);
  const { 
    isUnlocked,
    isUnlocking,
    unlockValue,
    error: unlockError,
    handleUnlock,
    checkUnlockStatus
  } = useLeadUnlock(id || '', user, lead);

  useEffect(() => {
    if (id && user) {
      checkUnlockStatus();
    }
  }, [id, user]);

  // Record visit without auth check
  const recordVisit = async (leadId: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.rpc('record_visit', {
        var_lead: leadId,
        var_user: user.id
      });
      if (error) throw error;
    } catch (err) {
      // Silently handle error - don't block navigation
    }
  };

  const handlePrevious = async () => {
    if (state?.leadIds && state.currentIndex > 0) {
      const previousId = state.leadIds[state.currentIndex - 1];
      const searchString = location.search;
      
      await recordVisit(previousId);
      navigate(`/leads/${previousId}${searchString}`, {
        state: {
          ...state,
          currentIndex: state.currentIndex - 1
        }
      });
    }
  };

  const handleNext = async () => {
    if (state?.leadIds && state.currentIndex < state.leadIds.length - 1) {
      const nextId = state.leadIds[state.currentIndex + 1];
      const searchString = location.search;
      
      await recordVisit(nextId);
      navigate(`/leads/${nextId}${searchString}`, {
        state: {
          ...state,
          currentIndex: state.currentIndex + 1
        }
      });
    }
  };

  const unlockLead = handleUnlock;

  if (isAuthLoading || isLeadLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#EDEEF0' }}>
        <div className="flex flex-col items-center">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (authError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#EDEEF0' }}>
        <div className="text-center">
          <p className="text-red-600">Authentication error. Please try again.</p>
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

  if (leadError || !lead) {
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
    <AuthContext.Provider value={{ user }}>
      <div className="min-h-screen" style={{ background: '#EDEEF0' }}>
        <LeadDetailHeader
          lead={lead}
          onUnlock={unlockLead}
          isUnlocking={isUnlocking}
          isUnlocked={isUnlocked}
          unlockValue={unlockValue}
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col-reverse md:flex-row gap-8">
            <div className="w-full md:flex-1">
              <LeadDetailContent lead={lead} />
            </div>
            <div className="w-full md:w-80">
              <LeadDetailSidebar lead={lead} />
            </div>
          </div>
        </div>
      </div>
    </AuthContext.Provider>
  );
}