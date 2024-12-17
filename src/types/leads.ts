export interface RecordedLead {
  lead_id: string;
  lead_name: string;
  focus: string;
  industry: string;
  lead_type: string;
  unlock_type: string;
  organization: string;
  event_name: string;
  unlocked_at: string;
  unlocked: boolean;
}

export interface LeadQueryResult {
  lead_id: string;
  unlocked_at: string;
  unlocked: boolean;
  leads: {
    lead_name: string;
    focus: string;
    industry: string;
    lead_type: string;
    unlock_type: string;
    organization: string;
    event_name: string;
  };
}