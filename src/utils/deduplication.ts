import type { Lead } from '../types';

interface GroupCounts {
  total: number;
  eventUrl: number;
  eventEmail: number;
  contactEmail: number;
  related_ids: string[];
}

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
  const groupCounts = new Map<string, GroupCounts>();
  
  // Group all leads (no separation of contacts now)
  for (const lead of leads) {
    const eventName = (lead.event_name || '').toLowerCase().trim();
    const organization = (lead.organization || '').toLowerCase().trim();
    const key = `${eventName}|${organization}`;
    
    if (!groups.has(key)) {
      groups.set(key, []);
      groupCounts.set(key, {
        total: 0,
        eventUrl: 0,
        eventEmail: 0,
        contactEmail: 0,
        related_ids: []
      });
    }
    
    const group = groups.get(key)!;
    const counts = groupCounts.get(key)!;
    
    group.push(lead);
    counts.total++;
    counts.related_ids.push(lead.id);
    
    if (isEventUrlType(lead)) counts.eventUrl++;
    if (isEventEmailType(lead)) counts.eventEmail++;
    if (isContactEmailType(lead)) counts.contactEmail++;
  }

  // Process each group according to the new rules
  const resultLeads: Lead[] = [];
  
  for (const [key, groupLeads] of groups.entries()) {
    const counts = groupCounts.get(key)!;
    
    // Rule 1: If group has any Event URL lead, make it unique
    const eventUrlLeads = groupLeads.filter(isEventUrlType);
    if (eventUrlLeads.length > 0) {
      // Get the first Event URL lead as unique
      const uniqueLead = eventUrlLeads[0];
      const uniqueId = uniqueLead.id;
      
      // All leads in group (including the unique lead) are related
      const relatedIds = groupLeads.map(lead => lead.id);
      
      resultLeads.push({
        ...uniqueLead,
        group_counts: {
          ...counts,
          related_ids: relatedIds
        }
      });
      continue;
    }

    // Rule 2: If group has Contact Email leads, all are unique
    const contactEmailLeads = groupLeads.filter(isContactEmailType);
    if (contactEmailLeads.length > 0) {
      // All leads in group (including contact emails) are related
      const relatedIds = groupLeads.map(lead => lead.id);
      
      // Add all contact email leads as unique
      for (const contactLead of contactEmailLeads) {
        resultLeads.push({
          ...contactLead,
          group_counts: {
            ...counts,
            related_ids: relatedIds
          }
        });
      }
      continue;
    }

    // Rule 3: Only Event Email leads remain, make one unique
    const eventEmailLeads = groupLeads.filter(isEventEmailType);
    if (eventEmailLeads.length > 0) {
      // Get first Event Email lead as unique
      const uniqueLead = eventEmailLeads[0];
      
      // All leads in group (including the unique lead) are related
      const relatedIds = groupLeads.map(lead => lead.id);
      
      resultLeads.push({
        ...uniqueLead,
        group_counts: {
          ...counts,
          related_ids: relatedIds
        }
      });
    }
  }

  return resultLeads;
}