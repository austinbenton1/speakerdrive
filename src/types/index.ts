export interface Lead {
  id: string;
  image_url: string;
  lead_name: string;
  focus: string;
  lead_type: 'Event' | 'Contact';
  industry: string;
  domain_type: string;
  organization: string;
  organization_type: string;
  event_info: string;
  event_name: string;
  event_url?: string;
  location: string;
  job_title?: string;
  subtext?: string;
  unlock_type: string;
}

export interface SpeakerLead {
  id: string;
  image: string;
  name: string;
  lead_name: string;
  focus: string;
  industryCategory: string;
  domainType: string;
  leadType: 'Event' | 'Contact';
  eventName: string;
  eventUrl?: string;
  organization: string;
  organizationType: string;
  location?: string;
  job_title?: string;
  unlockType: string;
  addedDate: string;
  eventInfo?: string;
  detailedInfo?: string;
  valueProfile?: string;
  outreachPathways?: string;
  infoUrl?: string;
  eventFormat?: string;
  tooltipLocation?: string;
  tooltipIndustryCategory?: string;
  tooltipEventFormat?: string;
  tooltipOrganization?: string;
  tooltipOrganizationType?: string;
  subtext?: string;
}

export interface UnlockedLead {
  id: string;
  name: string;
  focus: string;
  industry: string;
  image: string;
  unlockDate: Date;
}

export interface FilterOptions {
  targetAudience: string;
  jobTitle: string;
  searchEvent: string;
  organization: string;
  pastSpeakers: string;
  searchAll: string;
  location: string[];
  industry: string[];
  timeframe: string[];
  eventFormat: string[];
  organizationType: string[];
  unlockType?: string;
}