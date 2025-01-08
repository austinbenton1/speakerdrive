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
  event_info?: string;
  detailed_info?: string;
  event_name?: string;
  event_format?: string;
  region?: string;
  state?: string;
  city?: string;
  subtext?: string;
}