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
  organization_type?: string;
  job_title?: string;
  event_info?: string;
  detailed_info?: string;
  event_name?: string;
  event_format?: string;
  region?: string;
  state?: string;
  city?: string;
  subtext?: string;
}

export interface FilterOptions {
  targetAudience: string[];
  jobTitle: string[];
  searchEvent: string;
  organization: string[];
  pastSpeakers: string[];
  searchAll: string;
  location: string[];
  industry: string[];
  timeframe: string[];
  eventFormat: string[];
  organizationType: string[];
  region: string;
  state: string[];
  city: string[];
  unlockType?: string;
}

export interface OpenSections {
  eventFormat: boolean;
  industry: boolean;
  pastSpeakers: boolean;
  moreFilters: boolean;
  organizationType: boolean;
  location: boolean;
  jobTitle: boolean;
  region: boolean;
}