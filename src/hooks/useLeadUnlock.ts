import { create } from 'zustand';

interface LeadUnlockState {
  unlockedLeads: Record<string, boolean>;
  unlockLead: (leadId: string) => void;
  isLeadUnlocked: (leadId: string) => boolean;
}

// Simple state management without auth dependencies
export const useLeadUnlock = create<LeadUnlockState>((set, get) => ({
  unlockedLeads: {},
  unlockLead: (leadId: string) => {
    set((state) => ({
      unlockedLeads: {
        ...state.unlockedLeads,
        [leadId]: true,
      },
    }));
  },
  isLeadUnlocked: (leadId: string) => {
    return get().unlockedLeads[leadId] || false;
  },
}));