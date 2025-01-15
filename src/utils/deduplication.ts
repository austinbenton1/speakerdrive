import type { Lead } from '../types';

// Helper function to get unlock type priority
const getUnlockPriority = (type: string) => {
  if (type === 'Unlock Event URL') return 3;
  if (type === 'Unlock Contact Email') return 2;
  if (type === 'Unlock Event Email') return 1;
  return 0;
};

export function getUniqueLeads(leads: Lead[]): Lead[] {
  // First, track Contact Email leads with their original positions
  const contactEmailPositions = leads.reduce<{ lead: Lead; index: number }[]>((acc, lead, index) => {
    if (lead.unlock_type === 'Unlock Contact Email') {
      acc.push({ lead, index });
    }
    return acc;
  }, []);

  // Filter out Contact Email leads for deduplication of other leads
  const otherLeads = leads.filter(lead => lead.unlock_type !== 'Unlock Contact Email');
  
  // Sort remaining leads to prioritize URL > Event Email
  const sortedLeads = [...otherLeads].sort((a, b) => {
    // Compare event names first
    const eventNameA = (a.event_name || '').toLowerCase().trim();
    const eventNameB = (b.event_name || '').toLowerCase().trim();
    if (eventNameA !== eventNameB) {
      return eventNameA.localeCompare(eventNameB);
    }

    // If event names are same, compare organizations
    const orgA = (a.organization || '').toLowerCase().trim();
    const orgB = (b.organization || '').toLowerCase().trim();
    if (orgA !== orgB) {
      return orgA.localeCompare(orgB);
    }
    
    // If both event and org are same, compare unlock types
    const priorityA = getUnlockPriority(a.unlock_type);
    const priorityB = getUnlockPriority(b.unlock_type);
    return priorityB - priorityA;  // Higher priority first
  });

  // Process non-Contact Email leads for deduplication
  const uniqueMap = new Map<string, Lead>();
  sortedLeads.forEach(lead => {
    const eventName = (lead.event_name || '').toLowerCase().trim();
    const organization = (lead.organization || '').toLowerCase().trim();
    const key = `${eventName}|${organization}`;

    const existingLead = uniqueMap.get(key);
    if (!existingLead) {
      uniqueMap.set(key, lead);
    } else {
      const existingPriority = getUnlockPriority(existingLead.unlock_type);
      const currentPriority = getUnlockPriority(lead.unlock_type);
      
      if (currentPriority > existingPriority) {
        uniqueMap.set(key, lead);
      }
    }
  });

  // Get deduplicated leads
  const deduplicatedLeads = Array.from(uniqueMap.values());

  // Combine deduplicated leads with Contact Email leads in their original positions
  const result: Lead[] = [...deduplicatedLeads];
  
  // Insert Contact Email leads back in their original positions
  contactEmailPositions.forEach(({ lead, index }) => {
    // If the original position is beyond the current result length,
    // just append it at the end
    if (index >= result.length) {
      result.push(lead);
    } else {
      // Otherwise insert it at its original position
      result.splice(index, 0, lead);
    }
  });

  return result;
}