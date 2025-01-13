import type { Lead } from '../types';

// Helper function to get unlock type priority
const getUnlockPriority = (type: string) => {
  if (type === 'Unlock Event URL') return 3;
  if (type === 'Unlock Contact Email') return 2;
  if (type === 'Unlock Event Email') return 1;
  return 0;
};

export function getUniqueLeads(leads: Lead[]): Lead[] {
  // Create a map to store unique leads by event name and organization
  const uniqueMap = new Map<string, Lead>();
  
  // Sort leads to prioritize URL > Contact Email > Event Email
  const sortedLeads = [...leads].sort((a, b) => {
    // If event names are different, maintain original order
    if (a.event_name !== b.event_name) return 0;
    // If organizations are different, maintain original order
    if (a.organization !== b.organization) return 0;
    
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
      const existingPriority = getUnlockPriority(existingLead.unlock_type);
      const currentPriority = getUnlockPriority(lead.unlock_type);
      
      // Replace if current lead has higher priority
      if (currentPriority > existingPriority) {
        uniqueMap.set(key, lead);
      }
    }
  });
  
  return Array.from(uniqueMap.values());
}