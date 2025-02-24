export interface UnlockedLead {
  id: string;
  event_name: string;
  subtext: string | null;
  industry: string;
  image: string;
  unlockDate: Date;
  lead_type: 'Unlock Contact Email' | 'Unlock Event Email' | 'Unlock Event URL';
  keywords: string | null;
  unlock_value: string | null;
  focus: string | null;
  related_leads: number | null;
  pitch: string | null;
  lead_name?: string;
  job_title?: string;
}

export interface UnlockStatus {
  isUnlocked: boolean;
  unlockValue?: string | null;
}