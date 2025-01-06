export interface FilterOptions {
  targetAudience: string;
  jobTitle: string;
  searchEvent: string;
  organization: string;
  pastSpeakers: string;
  location: string[];
  industry: string[];
  timeframe: string[];
  eventFormat: string[];
  organizationType: string[];
  unlockType?: string;
}