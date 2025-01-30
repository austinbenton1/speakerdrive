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
  
  // First pass: Separate contacts and events
  const contactLeads = leads.filter(isContactEmailType);
  const eventLeads = leads.filter(lead => !isContactEmailType(lead));
  
  // Group only the event leads
  for (const lead of eventLeads) {
    const eventName = (lead.event_name || '').toLowerCase().trim();
    const organization = (lead.organization || '').toLowerCase().trim();
    const key = `${eventName}|${organization}`;
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(lead);
  }

  console.log('Total number of groups:', groups.size);
  console.log('Total number of contacts:', contactLeads.length);
  
  // Process each event group according to the rules
  const resultLeads: Lead[] = [];
  
  // First add all contacts (they are never deduplicated)
  resultLeads.push(...contactLeads);
  
  // Then process event groups
  for (const [key, groupLeads] of groups.entries()) {
    console.log('\nProcessing event group:', key);
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

    // Rule 2: For Event Email leads, show just one
    const eventEmailLeads = groupLeads.filter(isEventEmailType);
    
    if (eventEmailLeads.length > 0) {
      console.log('Found Event Email lead, taking only the first one');
      resultLeads.push(eventEmailLeads[0]);
      continue; // Skip to next group
    }

    // Rule 3: For any remaining cases, show just one lead from the group
    console.log('Taking first lead from remaining group');
    resultLeads.push(groupLeads[0]);
  }

  console.log('\nFinal result count:', resultLeads.length);
  console.log('Contacts:', contactLeads.length);
  console.log('Deduplicated events:', resultLeads.length - contactLeads.length);

  // Return the results without additional sorting
  return resultLeads;
}