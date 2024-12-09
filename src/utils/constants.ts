export interface Option {
  id: string;
  label: string;
}

export const services: Option[] = [
  { id: 'keynote', label: 'Keynote Speaker' },
  { id: 'workshop', label: 'Workshop Leader' },
  { id: 'moderator', label: 'Panel Moderator' },
  { id: 'facilitator', label: 'Facilitator' },
  { id: 'coach', label: 'Coach/Consultant' },
];

export const industries: Option[] = [
  { id: 'leadership', label: 'Leadership & Corporate Development' },
  { id: 'education', label: 'Education & Training' },
  { id: 'business', label: 'General Business & Entrepreneurship' },
  { id: 'community', label: 'Community, Culture & Inclusion' },
  { id: 'health', label: 'Health, Wellness & Sustainability' },
  { id: 'technology', label: 'Technology & Media' },
  { id: 'finance', label: 'Finance, Business & Corporate Services' },
  { id: 'nonprofit', label: 'Nonprofit, Associations & Public Sector' },
  { id: 'sales', label: 'Sales & Consumer Services' },
  { id: 'manufacturing', label: 'Manufacturing & Industrial' },
  { id: 'other', label: 'Other' },
];