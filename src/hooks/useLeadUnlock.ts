import { useState, useEffect } from 'react';
import { unlockLead, checkLeadUnlocked } from '../lib/api/unlocks';
import type { UnlockStatus } from '../types/unlocks';

interface UseLeadUnlockResult {
  isUnlocked: boolean;
  isUnlocking: boolean;
  unlockValue: string | null;
  error: string | null;
  handleUnlock: () => Promise<void>;
  checkUnlockStatus: () => Promise<void>;
}

export function useLeadUnlock(leadId: string): UseLeadUnlockResult {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockValue, setUnlockValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check unlock status on mount and when leadId changes
  useEffect(() => {
    if (leadId) {
      checkUnlockStatus();
    }
  }, [leadId]);

  const checkUnlockStatus = async () => {
    try {
      const status = await checkLeadUnlocked(leadId);
      setIsUnlocked(status.isUnlocked);
      setUnlockValue(status.unlockValue || null);
    } catch (err) {
      console.error('Error checking unlock status:', err);
    }
  };

  const handleUnlock = async () => {
    if (!leadId || isUnlocking) return;

    try {
      setIsUnlocking(true);
      setError(null);

      const { success, error } = await unlockLead(leadId);
      
      if (!success) {
        throw new Error(error || 'Failed to unlock lead');
      }

      // Check updated status after successful unlock
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