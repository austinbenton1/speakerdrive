import type { LucideIcon } from 'lucide-react';

export interface RecordedLead {
  lead_id: string;
  event_name: string;
  focus: string;
  industry: string;
  lead_type: string;
  subtext: string | null;
  image_url: string;
  unlocked_at: string;
  unlocked: boolean;
}

export interface Lead {
  id: string;
  image_url?: string;
  lead_name?: string;
  focus?: string;
  lead_type?: string;
  unlock_type?: string;
  industry?: string;
  organization?: string;
  organization_type?: string;
  event_info?: string;
  detailed_info?: string;
  event_name?: string;
  event_url?: string;
  event_format?: string;
  job_title?: string;
  subtext?: string;
  past_speakers_events?: string;
  region?: string;
  state?: string;
  city?: string;
  keywords?: string;
  group_counts?: {
    total: number;
    eventUrl: number;
    eventEmail: number;
    contactEmail: number;
  };
  unlock_value?: string;
  created_at: string;
  info_url?: string;
  tooltip_event_format?: string;
  tooltip_organization_type?: string;
  tooltip_location?: string;
  tooltip_organization?: string;
  tooltip_industry_category?: string;
  image_persistence?: boolean;
  value_profile?: string;
  outreach_pathways?: string;
  dedup_value: number | null;
  related_leads: number | null;
}

export interface QuickInfoItem {
  icon: LucideIcon;
  label: string;
  value: string | null;
  tooltip?: string;
  show: boolean;
  onClick?: () => void;
  isLink?: boolean;
}

// Rest of the types remain the same...