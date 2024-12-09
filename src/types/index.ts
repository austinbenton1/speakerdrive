export interface Lead {
  id: string;
  image_url: string;
  lead_name: string;
  focus: string;
  lead_type: 'Event' | 'Contact';
  unlock_type: 'Contact Email' | 'Event Email' | 'Event URL';
  industry: string;
  domain_type: string;
  organization: string;
  event_info: string;
  event_name: string;
  location: string;
}

export interface SpeakerLead {
  id: string;
  image: string;
  name: string;
  focus: string;
  unlockType: 'Contact Email' | 'Event Email' | 'Event URL';
  industryCategory: string;
  domainType: string;
  leadType: 'Event' | 'Contact';
  isUnlocked: boolean;
  eventName: string;
  organization: string;
  location?: string;
  addedDate: string;
  eventInfo?: string;
  detailedInfo?: string;
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
  domain: string[];
}