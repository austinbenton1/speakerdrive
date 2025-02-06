import type { Lead } from '../types';

export function getUniqueLeads(leads: Lead[]): Lead[] {
  // Separate contacts and events
  const contacts = leads.filter(lead => lead.lead_type === 'Contact');
  const events = leads.filter(lead => lead.lead_type === 'Event');

  // Process contacts - keep all of them
  const processedContacts = contacts.map(contact => ({
    ...contact,
    dedup_value: 2 // All contacts are kept
  }));

  // Group events by event name
  const eventGroups = new Map<string, Lead[]>();
  events.forEach(event => {
    const key = event.event_name?.toLowerCase().trim() || '';
    if (!eventGroups.has(key)) {
      eventGroups.set(key, []);
    }
    eventGroups.get(key)!.push(event);
  });

  // Process each event group
  const processedEvents: Lead[] = [];
  eventGroups.forEach(groupLeads => {
    // Sort by creation date
    const sortedLeads = [...groupLeads].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateA.getTime() - dateB.getTime();
    });

    // Find URL lead
    const urlLead = sortedLeads.find(lead => 
      lead.unlock_type === 'Unlock Event URL'
    );

    if (urlLead) {
      // If URL lead exists, keep only that one
      processedEvents.push({
        ...urlLead,
        dedup_value: 2
      });
      return;
    }

    // Find Tier 1 email lead
    const tier1Patterns = [
      'event', 'confer', 'speak', 'coach',
      'consult', 'train', 'book', 'present'
    ];
    const tier1Lead = sortedLeads.find(lead => 
      lead.unlock_type === 'Unlock Event Email' &&
      tier1Patterns.some(pattern => 
        lead.unlock_value?.toLowerCase().includes(pattern)
      )
    );

    if (tier1Lead) {
      // If Tier 1 email lead exists, keep that one
      processedEvents.push({
        ...tier1Lead,
        dedup_value: 2
      });
      return;
    }

    // Find Tier 2 email lead
    const tier2Patterns = [
      'info', 'contact', 'hello', 'support', 'inquir'
    ];
    const tier2Lead = sortedLeads.find(lead => 
      lead.unlock_type === 'Unlock Event Email' &&
      tier2Patterns.some(pattern => 
        lead.unlock_value?.toLowerCase().includes(pattern)
      )
    );

    if (tier2Lead) {
      // If Tier 2 email lead exists, keep that one
      processedEvents.push({
        ...tier2Lead,
        dedup_value: 1
      });
      return;
    }

    // Find any email lead
    const emailLead = sortedLeads.find(lead => 
      lead.unlock_type === 'Unlock Event Email'
    );

    if (emailLead) {
      // If any email lead exists, keep that one
      processedEvents.push({
        ...emailLead,
        dedup_value: 1
      });
    }
  });

  // Combine and return all processed leads
  return [...processedContacts, ...processedEvents];
}