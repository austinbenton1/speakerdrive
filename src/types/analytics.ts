export interface IndustrySummary {
  industry: string;
  totalLeads: number;
  percentage: number;
  monthlyTrend: 'up' | 'down' | 'stable';
}

export interface AnalyticsReport {
  totalUnlockedLeads: number;
  industryDistribution: IndustrySummary[];
  timestamp: Date;
}