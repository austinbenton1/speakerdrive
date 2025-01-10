import type { Lead } from '../types';

export function getUniqueLeads(leads: Lead[]): Lead[] {
  // Create a map to store unique leads by event name and organization
  const uniqueMap = new Map<string, Lead>();
  
  // Sort leads by most recently added first (assuming newer leads are better)
  const sortedLeads = [...leads].sort((a, b) => {
    // If event names are different, maintain original order
    if (a.event_name !== b.event_name) return 0;
    // If organizations are different, maintain original order
    if (a.organization !== b.organization) return 0;
    // Otherwise sort by id (assuming newer ids are higher)
    return b.id.localeCompare(a.id);
  });

  // Process each lead
  sortedLeads.forEach(lead => {
    // Create a unique key combining event name and organization
    const eventName = (lead.event_name || '').toLowerCase().trim();
    const organization = (lead.organization || '').toLowerCase().trim();
    const key = `${eventName}|${organization}`;

    // Only add if this combination doesn't exist yet
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, lead);
    }
  });
  
  return Array.from(uniqueMap.values());
}