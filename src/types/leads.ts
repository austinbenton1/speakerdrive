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