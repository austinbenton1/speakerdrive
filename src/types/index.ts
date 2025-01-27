export interface Lead {
  id: string;
  image_url: string;
  lead_name: string;
  focus: string;
  lead_type: string;
  unlock_type: string;
  industry: string;
  organization: string;
  organization_type?: string;
  event_info?: string;
  detailed_info?: string;
  event_name: string;
  event_url?: string;
  event_format?: string;
  job_title?: string;
  subtext?: string;
  past_speakers_events?: string[];
  region?: string;
  state?: string;
  city?: string;
  keywords?: string;
}

export interface FilterOptions {
  jobTitle?: string[] | string;
  searchEvent: string;
  organization: string[];
  pastSpeakers: string[];
  searchAll: string;
  location: string[] | string;
  industry: string[];
  timeframe: string[];
  eventFormat: string[];
  organizationType: string[];
  region: string;
  state: string[];
  city: string[];
  unlockType: string[]; // Changed to string[] to always be an array
}

export interface OpenSections {
  eventFormat: boolean;
  industry: boolean;
  pastSpeakers: boolean;
  moreFilters: boolean;
  organizationType: boolean;
  location: boolean;
  region: boolean;
  unlockType: boolean;
}