import type { Lead } from '../types';

interface GroupCounts {
  total: number;
  eventUrl: number;
  eventEmail: number;
  contactEmail: number;
  related_ids: string[];
}

export function getUniqueLeads(leads: Lead[]): Lead[] {
  // Helper functions
  const isEventUrlType = (lead: Lead) => 
    lead.unlock_type === 'Unlock Event URL';
  
  const isContactEmailType = (lead: Lead) => 
    lead.unlock_type === 'Unlock Contact Email';

  const isEventEmailType = (lead: Lead) =>
    lead.unlock_type === 'Unlock Event Email';

  const matchesTier1Patterns = (value?: string) => {
    if (!value) return false;
    const patterns = [
      'event', 'confer', 'speak', 'coach',
      'consult', 'train', 'book', 'present'
    ];
    return patterns.some(pattern => 
      value.toLowerCase().includes(pattern.toLowerCase())
    );
  };

  const matchesTier2Patterns = (value?: string) => {
    if (!value) return false;
    const patterns = [
      'info', 'contact', 'hello', 'support', 'inquir'
    ];
    return patterns.some(pattern => 
      value.toLowerCase().includes(pattern.toLowerCase())
    );
  };

  // Group leads by event name and organization
  const groups = new Map<string, Lead[]>();
  const groupCounts = new Map<string, GroupCounts>();
  const getGroupKey = (lead: Lead): string => {
    const eventName = (lead.event_name || '').toLowerCase().trim();
    const organization = (lead.organization || '').toLowerCase().trim();
    return `${eventName}|${organization}`;
  };
  
  for (const lead of leads) {
    try {
      const key = getGroupKey(lead);
    
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
    } catch (error) {
      console.error('Error processing lead:', error, lead);
      continue;
    }
  }

  // Process each group according to the new rules
  const resultLeads: Lead[] = [];
  
  for (const [key, groupLeads] of groups.entries()) {
    const counts = groupCounts.get(key)!;
    const relatedIds = groupLeads.map(lead => lead.id);

    // Rule 1: Keep ALL Contact leads
    const contactLeads = groupLeads.filter(isContactEmailType);
    for (const contactLead of contactLeads) {
      resultLeads.push({
        ...contactLead,
        dedup_value: 2,
        related_leads: counts.total,
        group_counts: {
          ...counts,
          related_ids: relatedIds
        }
      });
    }

    // Process Event leads
    const eventLeads = groupLeads.filter(lead => !isContactEmailType(lead));
    if (eventLeads.length === 0) continue;

    // Rule 2a: Highest Priority - Event URL
    const eventUrlLeads = eventLeads.filter(isEventUrlType);
    if (eventUrlLeads.length > 0) {
      // Get earliest Event URL lead
      const earliestUrlLead = eventUrlLeads.reduce((earliest, current) => {
        const earliestDate = earliest.created_at ? new Date(earliest.created_at) : new Date(0);
        const currentDate = current.created_at ? new Date(current.created_at) : new Date(0);
        return currentDate < earliestDate ? current : earliest;
      });

      resultLeads.push({
        ...earliestUrlLead,
        dedup_value: 2,
        related_leads: counts.total,
        group_counts: {
          ...counts,
          related_ids: relatedIds
        }
      });
      continue;
    }

    // Rule 2b: High Priority - Tier 1 Email Patterns
    const tier1Leads = eventLeads.filter(lead => 
      isEventEmailType(lead) && matchesTier1Patterns(lead.unlock_value)
    );
    if (tier1Leads.length > 0) {
      // Keep any matching Tier 1 lead
      const selectedLead = tier1Leads[0];
      resultLeads.push({
        ...selectedLead,
        dedup_value: 2,
        related_leads: counts.total,
        group_counts: {
          ...counts,
          related_ids: relatedIds
        }
      });
      continue;
    }

    // Rule 2c: Lower Priority - Tier 2 Email Patterns
    const tier2Leads = eventLeads.filter(lead => 
      isEventEmailType(lead) && matchesTier2Patterns(lead.unlock_value)
    );
    if (tier2Leads.length > 0) {
      // Keep any matching Tier 2 lead
      const selectedLead = tier2Leads[0];
      resultLeads.push({
        ...selectedLead,
        dedup_value: 1,
        related_leads: counts.total,
        group_counts: {
          ...counts,
          related_ids: relatedIds
        }
      });
      continue;
    }

    // Rule 2d: Lowest Priority - Any Event Email
    const emailLeads = eventLeads.filter(isEventEmailType);
    if (emailLeads.length > 0) {
      // Get earliest email lead
      const earliestEmailLead = emailLeads.reduce((earliest, current) => {
        const earliestDate = earliest.created_at ? new Date(earliest.created_at) : new Date(0);
        const currentDate = current.created_at ? new Date(current.created_at) : new Date(0);
        return currentDate < earliestDate ? current : earliest;
      });

      resultLeads.push({
        ...earliestEmailLead,
        dedup_value: 1,
        related_leads: counts.total,
        group_counts: {
          ...counts,
          related_ids: relatedIds
        }
      });
    }
  }

  return resultLeads;
}