import type { RecordedLead } from '../types/leads';
import { getUnlockedLeads } from './leads';

export interface IndustryStats {
  label: string;
  count: number;
  percentage: number;
}

export function calculateIndustryDistribution(leads: RecordedLead[]): IndustryStats[] {
  // Get only unlocked leads
  const unlockedLeads = getUnlockedLeads(leads);
  
  // Group by industry and count
  const industryCount = unlockedLeads.reduce((acc, lead) => {
    const industry = lead.industry || 'Uncategorized';
    acc[industry] = (acc[industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total for percentages
  const total = Object.values(industryCount).reduce((sum, count) => sum + count, 0);

  // Transform into final format with percentages
  return Object.entries(industryCount)
    .map(([label, count]) => ({
      label,
      count,
      percentage: (count / total) * 100
    }))
    .sort((a, b) => b.count - a.count);
}