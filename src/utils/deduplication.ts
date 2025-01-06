import type { Lead } from '../types';

export function getUniqueLeads(leads: Lead[]): Lead[] {
  const uniqueMap = new Map<string, Lead>();
  
  leads.forEach(lead => {
    const key = `${lead.event_name || ''}|${lead.organization || ''}`.toLowerCase();
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, lead);
    }
  });
  
  return Array.from(uniqueMap.values());
}