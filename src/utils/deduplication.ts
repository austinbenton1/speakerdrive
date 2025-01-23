import type { Lead } from '../types';

// Helper function to get unlock type priority
const getUnlockPriority = (type: string) => {
  if (type === 'Unlock Event URL') return 3;
  if (type === 'Unlock Contact Email') return 2;
  if (type === 'Unlock Event Email') return 1;
  return 0;
};

export function getUniqueLeads(leads: Lead[]): Lead[] {
  // Helper functions to check unlock types
  const isEventUrlType = (lead: Lead) => 
    lead.unlock_type === 'Unlock Event URL';
  
  const isContactEmailType = (lead: Lead) => 
    lead.unlock_type === 'Unlock Contact Email';

  const isEventEmailType = (lead: Lead) =>
    lead.unlock_type === 'Unlock Event Email';

  // Group all leads by event name and organization
  const groups = new Map<string, Lead[]>();
  
  // Group the leads
  for (const lead of leads) {
    const eventName = (lead.event_name || '').toLowerCase().trim();
    const organization = (lead.organization || '').toLowerCase().trim();
    const key = `${eventName}|${organization}`;
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(lead);
  }

  console.log('Total number of groups:', groups.size);
  
  // Process each group according to the rules
  const resultLeads: Lead[] = [];
  
  // Process each group
  for (const [key, groupLeads] of groups.entries()) {
    console.log('\nProcessing group:', key);
    console.log('Group leads:', groupLeads.map(l => ({ 
      event: l.event_name, 
      org: l.organization, 
      type: l.unlock_type 
    })));

    // Rule 1: If group has any Event URL lead, show only one such lead
    const eventUrlLeads = groupLeads.filter(isEventUrlType);
    
    if (eventUrlLeads.length > 0) {
      console.log('Found Event URL lead, taking only the first one');
      resultLeads.push(eventUrlLeads[0]);
      continue; // Skip to next group
    }

    // Rule 2: If group has no Event URL but has Contact Email leads, show all Contact Email leads
    const contactEmailLeads = groupLeads.filter(isContactEmailType);
    
    if (contactEmailLeads.length > 0) {
      console.log('No Event URL lead found, adding all Contact Email leads:', contactEmailLeads.length);
      resultLeads.push(...contactEmailLeads);
      continue; // Skip to next group
    }

    // Rule 3: For all other cases (including Event Email), show just one lead from the group
    console.log('No Event URL or Contact Email leads, taking first lead');
    resultLeads.push(groupLeads[0]);
  }

  console.log('\nFinal result count:', resultLeads.length);
  console.log('Groups with potential issues:');
  // Check for any remaining duplicates in results
  const resultGroups = new Map<string, Lead[]>();
  for (const lead of resultLeads) {
    const key = `${lead.event_name?.toLowerCase().trim()}|${lead.organization?.toLowerCase().trim()}`;
    if (!resultGroups.has(key)) {
      resultGroups.set(key, []);
    }
    resultGroups.get(key)!.push(lead);
  }
  
  for (const [key, group] of resultGroups.entries()) {
    if (group.length > 1) {
      console.log('Duplicate found in results:', key);
      console.log('Types:', group.map(l => l.unlock_type));
    }
  }

  // Sort final results by event name and then organization
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
    return orgA.localeCompare(orgB);
  });
}