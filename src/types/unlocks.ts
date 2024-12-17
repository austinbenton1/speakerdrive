export interface UnlockedLead {
  name: string;
  focus: string;
  unlocked_at: string;
}

export interface UnlockStatus {
  isUnlocked: boolean;
  unlockValue?: string | null;
}