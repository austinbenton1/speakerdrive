import type { Lead } from '../types';

export function getUniqueLeads(leads: Lead[]): Lead[] {
  // Create a map to store unique leads by event name and organization
  const uniqueMap = new Map<string, Lead>();
  
  // Sort leads to prioritize URL > Contact Email > Event Email
  const sortedLeads = [...leads].sort((a, b) => {
    // If event names are different, maintain original order
    if (a.event_name !== b.event_name) return 0;
    // If organizations are different, maintain original order
    if (a.organization !== b.organization) return 0;
    
    // Prioritize unlock types
    const getUnlockPriority = (type: string) => {
      if (type.includes('URL')) return 3;
      if (type.includes('Contact Email')) return 2;
      if (type.includes('Event Email')) return 1;
      return 0;
    };

    const priorityA = getUnlockPriority(a.unlock_type);
    const priorityB = getUnlockPriority(b.unlock_type);
    
    // Higher priority first
    return priorityB - priorityA;
  });

  // Process each lead
  sortedLeads.forEach(lead => {
    // Create a unique key combining event name and organization
    const eventName = (lead.event_name || '').toLowerCase().trim();
    const organization = (lead.organization || '').toLowerCase().trim();
    const key = `${eventName}|${organization}`;

    // Only add if this combination doesn't exist yet
    // or if we have a higher priority unlock type
    const existingLead = uniqueMap.get(key);
    if (!existingLead) {
      uniqueMap.set(key, lead);
    } else {
      // Check if current lead has higher priority unlock type
      const existingPriority = existingLead.unlock_type.includes('URL') ? 3 
        : existingLead.unlock_type.includes('Contact Email') ? 2 
        : existingLead.unlock_type.includes('Event Email') ? 1 
        : 0;
      
      const currentPriority = lead.unlock_type.includes('URL') ? 3 
        : lead.unlock_type.includes('Contact Email') ? 2 
        : lead.unlock_type.includes('Event Email') ? 1 
        : 0;
      
      if (currentPriority > existingPriority) {
        uniqueMap.set(key, lead);
      }
    }
  });
  
  return Array.from(uniqueMap.values());
}