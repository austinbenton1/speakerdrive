export interface UnlockedLead {
  id: string;
  event_name: string;
  subtext: string | null;
  industry: string;
  image: string;
  unlockDate: Date;
  lead_type: 'Event' | 'Contact';
  keywords: string | null;
  unlock_value: string | null;
  focus: string | null;
  related_leads: number | null;
}

export interface UnlockStatus {
  isUnlocked: boolean;
  unlockValue?: string | null;
}