import type { Lead } from '../types';

// Helper function to get unlock type priority
const getUnlockPriority = (type: string) => {
  if (type === 'Unlock Event URL') return 3;
  if (type === 'Unlock Contact Email') return 2;
  if (type === 'Unlock Event Email') return 1;
  return 0;
};

// Helper to check if lead has Event URL unlock type
const isEventUrlType = (lead: Lead) => lead.unlock_type === 'Unlock Event URL';

// Helper to check if lead has Contact Email unlock type
const isContactEmailType = (lead: Lead) => lead.unlock_type === 'Unlock Contact Email';

export function getUniqueLeads(leads: Lead[]): Lead[] {
  // First, group leads by event name and organization
  const groupedLeads = leads.reduce<Map<string, Lead[]>>((groups, lead) => {
    const eventName = (lead.event_name || '').toLowerCase().trim();
    const organization = (lead.organization || '').toLowerCase().trim();
    const key = `${eventName}|${organization}`;
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(lead);
    return groups;
  }, new Map());

  // Process each group and collect results
  const resultLeads: Lead[] = [];
  
  groupedLeads.forEach((groupLeads, key) => {
    // Sort leads within group by priority
    const sortedGroupLeads = [...groupLeads].sort((a, b) => {
      const priorityA = getUnlockPriority(a.unlock_type);
      const priorityB = getUnlockPriority(b.unlock_type);
      return priorityB - priorityA;  // Higher priority first
    });

    // Check if group has any Event URL leads
    const hasEventUrl = sortedGroupLeads.some(isEventUrlType);

    if (hasEventUrl) {
      // If there's an Event URL lead, just take the highest priority lead
      resultLeads.push(sortedGroupLeads[0]);
    } else {
      // If no Event URL lead, include all Contact Email leads plus the highest priority of other types
      const contactLeads = sortedGroupLeads.filter(isContactEmailType);
      const otherLeads = sortedGroupLeads.filter(lead => !isContactEmailType(lead));

      if (contactLeads.length > 0) {
        // Add all Contact Email leads
        resultLeads.push(...contactLeads);
        
        // If there are other types and none were Contact Email, add the highest priority one
        if (otherLeads.length > 0 && contactLeads.length === 0) {
          resultLeads.push(otherLeads[0]);
        }
      } else {
        // If no Contact Email leads, just add the highest priority lead
        resultLeads.push(sortedGroupLeads[0]);
      }
    }
  });

  // Sort final results by event name, organization, and then priority
  return resultLeads.sort((a, b) => {
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
}