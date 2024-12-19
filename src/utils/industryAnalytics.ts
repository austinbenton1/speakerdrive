import type { RecordedLead } from '../types/leads';
import { getUnlockedLeads } from './leads';
import { industries } from '../constants/filters';

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
    // Map to standardized industry or use Uncategorized
    const industry = industries.includes(lead.industry) ? lead.industry : 'Uncategorized';
    acc[industry] = (acc[industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total for percentages
  const total = Object.values(industryCount).reduce((sum, count) => sum + count, 0);

  // Transform into final format with percentages, ensuring all industries are represented
  const stats = industries.map(industry => ({
    label: industry,
    count: industryCount[industry] || 0,
    percentage: ((industryCount[industry] || 0) / total) * 100
  }));

  // Add uncategorized if it exists
  if (industryCount['Uncategorized']) {
    stats.push({
      label: 'Uncategorized',
      count: industryCount['Uncategorized'],
      percentage: (industryCount['Uncategorized'] / total) * 100
    });
  }

  // Sort by count in descending order
  return stats.sort((a, b) => b.count - a.count);
}