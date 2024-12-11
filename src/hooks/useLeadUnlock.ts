import { create } from 'zustand';
import { unlockLead, checkLeadUnlocked } from '../lib/api/unlocks';

interface LeadUnlockState {
  unlockedLeads: Record<string, boolean>;
  isUnlocking: Record<string, boolean>;
  unlockError: Record<string, string | null>;
  unlockLead: (leadId: string) => Promise<void>;
  isLeadUnlocked: (leadId: string) => boolean;
  checkUnlockStatus: (leadId: string) => Promise<void>;
}

export const useLeadUnlock = create<LeadUnlockState>((set, get) => ({
  unlockedLeads: {},
  isUnlocking: {},
  unlockError: {},
  unlockLead: async (leadId: string) => {
    // Set unlocking state
    set((state) => ({
      isUnlocking: { ...state.isUnlocking, [leadId]: true },
      unlockError: { ...state.unlockError, [leadId]: null }
    }));

    try {
      const { error } = await unlockLead(leadId);
      
      if (error) {
        set((state) => ({
          unlockError: { ...state.unlockError, [leadId]: error.message }
        }));
        return;
      }

      set((state) => ({
        unlockedLeads: { ...state.unlockedLeads, [leadId]: true }
      }));
    } finally {
      set((state) => ({
        isUnlocking: { ...state.isUnlocking, [leadId]: false }
      }));
    }
  },
  isLeadUnlocked: (leadId: string) => {
    return get().unlockedLeads[leadId] || false;
  },
  checkUnlockStatus: async (leadId: string) => {
    const isUnlocked = await checkLeadUnlocked(leadId);
    if (isUnlocked) {
      set((state) => ({
        unlockedLeads: { ...state.unlockedLeads, [leadId]: true }
      }));
    }
  }
}));