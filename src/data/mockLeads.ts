import type { SpeakerLead } from '../types';

export const mockLeads: SpeakerLead[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    name: 'TechConf 2024',
    focus: 'AI & Machine Learning',
    unlockType: 'Event URL',
    industryCategory: 'Technology & Media',
    extensionType: 'com',
    leadType: 'Event',
    isUnlocked: false,
    eventPurpose: 'Premier technology conference focusing on artificial intelligence and machine learning advancements in enterprise applications.',
    hostOrganization: 'TechCorp International',
    targetAudience: 'CTOs, Tech Leaders, AI Researchers',
    location: 'San Francisco, CA',
    addedToSpeakerDrive: 'Within the Last Week',
    eventDetails: {
      location: 'Hybrid (In-person + Virtual)',
      format: 'Conference'
    },
    additionalInfo: 'Looking for thought leaders to share insights on practical AI implementation, emerging technologies, and future trends. Previous speakers include leaders from major tech companies.'
  }
];