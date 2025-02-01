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
  lead_name: string | null;
  focus: string | null;
  image_url: string | null;
  lead_type: string | null;
  unlock_type: string | null;
  unlock_value: string | null;
  industry: string | null;
  organization: string | null;
  event_name: string | null;
  event_info: string | null;
  detailed_info: string | null;
  region: string | null;
  past_speakers_events: string | null;
  created_at: string;
  event_url: string | null;
  event_format: string | null;
  info_url: string | null;
  organization_type: string | null;
  tooltip_event_format: string | null;
  tooltip_organization_type: string | null;
  tooltip_location: string | null;
  tooltip_organization: string | null;
  tooltip_industry_category: string | null;
  image_persistence: boolean | null;
  value_profile: string | null;
  outreach_pathways: string | null;
  job_title: string | null;
  subtext: string | null;
  state: string | null;
  city: string | null;
  keywords: string | null;
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