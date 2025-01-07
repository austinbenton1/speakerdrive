export interface OpenSections {
  eventFormat: boolean;
  industry: boolean;
  pastSpeakers: boolean;
  moreFilters: boolean;
  jobTitle: boolean;
  region: boolean;
}

export interface FilterOptions {
  targetAudience: string[];
  jobTitle: string;
  searchEvent: string;
  organization: string[];
  pastSpeakers: string[];
  searchAll: string;
  industry: string[];
  timeframe: string[];
  eventFormat: string[];
  unlockType?: string;
  region: string;
  state: string[];
}

export interface SpeakerLead {
  id: string;
  image: string;
  name: string;
  lead_name?: string;
  focus: string;
  unlockType: string;
  industry: string;
  leadType: string;
  isUnlocked: boolean;
  eventName?: string;
  eventUrl?: string;
  organization?: string;
  createdAt?: string;
  eventInfo?: string;
  detailedInfo?: string;
  valueProfile?: string;
  outreachPathways?: string;
  unlockValue?: string;
  infoUrl?: string;
  eventFormat?: string;
  tooltipIndustryCategory?: string;
  tooltipEventFormat?: string;
  tooltipOrganization?: string;
  tooltipEventName?: string;
  job_title?: string;
  subtext?: string;
  region?: string;
  state?: string[];
  city?: string[];
}

export interface Lead {
  id: string;
  lead_name: string;
  focus?: string;
  industry?: string;
  image_url?: string;
  lead_type: string;
  unlock_type: string;
  domain_type?: string;
  organization?: string;
  event_info?: string;
  event_name?: string;
  region?: string;
  state?: string;
  city?: string;
}