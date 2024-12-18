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
  location: string;
}

export interface SpeakerLead {
  id: string;
  image: string;
  name: string;
  focus: string;
  industryCategory: string;
  domainType: string;
  leadType: 'Event' | 'Contact';
  eventName: string;
  organization: string;
  organizationType: string;
  location?: string;
  addedDate: string;
  eventInfo?: string;
  detailedInfo?: string;
  infoUrl?: string;
  eventFormat?: string;
  tooltipLocation?: string;
  tooltipIndustryCategory?: string;
  tooltipEventFormat?: string;
  tooltipOrganization?: string;
  tooltipOrganizationType?: string;
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
}