import { useState, useEffect } from 'react';
import { unlockLead, checkLeadUnlocked } from '../lib/api/unlocks';
import type { UnlockStatus } from '../types/unlocks';
import { User } from '@supabase/supabase-js';

interface UseLeadUnlockResult {
  isUnlocked: boolean;
  isUnlocking: boolean;
  unlockValue: string | null;
  error: string | null;
  handleUnlock: () => Promise<void>;
  checkUnlockStatus: () => Promise<void>;
}

export function useLeadUnlock(leadId: string, user: User | null): UseLeadUnlockResult {
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
      setUnlockValue(status.unlockValue || null);
      setError(null);
      setRetryCount(0);
    } catch (err) {
      console.error('Error checking lead unlock status:', err);
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
      
      const response = await unlockLead(leadId, user);
      if (!response.success) {
        throw new Error(response.error || 'Failed to unlock lead');
      }
      
      await checkUnlockStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock lead');
      console.error('Error unlocking lead:', err);
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