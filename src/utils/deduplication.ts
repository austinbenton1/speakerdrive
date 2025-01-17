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
  // Special handling for Contact Email and Event URL leads
  const contactEmailLeads = leads.filter(lead => lead.unlock_type === 'Unlock Contact Email');
  const eventUrlLeads = leads.filter(lead => lead.unlock_type === 'Unlock Event URL');
  const otherLeads = leads.filter(lead => 
    lead.unlock_type !== 'Unlock Contact Email' && 
    lead.unlock_type !== 'Unlock Event URL'
  );

  // If all leads are Contact Email type, return them all
  if (leads.length === contactEmailLeads.length) return leads;

  // First, group leads by event name and organization
  const groupedLeads = otherLeads.reduce<Map<string, Lead[]>>((groups, lead) => {
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
    // For other leads, just take the highest priority one from each group
    const sortedGroupLeads = [...groupLeads].sort((a, b) => {
      const priorityA = getUnlockPriority(a.unlock_type);
      const priorityB = getUnlockPriority(b.unlock_type);
      return priorityB - priorityA;
    });
    resultLeads.push(sortedGroupLeads[0]);
  });

  // Group Event URL leads by URL to deduplicate
  const eventUrlGroups = new Map<string, Lead>();
  eventUrlLeads.forEach(lead => {
    const key = `${lead.event_name}|${lead.organization}`;
    if (!eventUrlGroups.has(key)) {
      eventUrlGroups.set(key, lead);
    }
  });

  // Combine all leads
  resultLeads.push(...contactEmailLeads, ...Array.from(eventUrlGroups.values()));

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