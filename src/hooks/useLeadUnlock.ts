import { useState, useEffect } from 'react';
import { checkLeadUnlocked } from '../lib/api/unlocks';
import type { UnlockStatus } from '../types/unlocks';
import { User } from '@supabase/supabase-js';
import type { SpeakerLead } from '../types/leads';
import { supabase } from '../lib/supabase';

interface UseLeadUnlockResult {
  isUnlocked: boolean;
  isUnlocking: boolean;
  unlockValue: string | null;
  error: string | null;
  handleUnlock: () => Promise<void>;
  checkUnlockStatus: () => Promise<void>;
}

export function useLeadUnlock(leadId: string, user: User | null, lead?: SpeakerLead | null): UseLeadUnlockResult {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockValue, setUnlockValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const checkUnlockStatus = async () => {
    if (!user) return;
    
    try {
      const status = await checkLeadUnlocked(leadId, user);
      setIsUnlocked(status.isUnlocked);
      setUnlockValue(status.isUnlocked ? status.unlockValue : null);
      setError(null);
      setRetryCount(0);
    } catch (err) {
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(checkUnlockStatus, 1000 * Math.pow(2, retryCount));
      } else {
        setError('Failed to check unlock status. Please try again.');
      }
    }
  };

  useEffect(() => {
    if (leadId && user) {
      checkUnlockStatus();
    }
  }, [leadId, user]);

  const handleUnlock = async () => {
    if (!leadId || isUnlocking || !user) return;

    try {
      setIsUnlocking(true);
      setError(null);
      
      // Update unlocked_leads table
      const { error: updateError } = await supabase
        .from('unlocked_leads')
        .update({ 
          unlocked: true,
          unlocked_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('lead_id', leadId);

      if (updateError) throw updateError;
      
      await checkUnlockStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock lead');
    } finally {
      setIsUnlocking(false);
    }
  };

  return {
    isUnlocked,
    isUnlocking,
    unlockValue,
    error,
    handleUnlock,
    checkUnlockStatus
  };
}