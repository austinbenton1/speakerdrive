import React, { useState } from 'react';
import SearchFilters from './SearchFilters';
import LeadsTable from './LeadsTable';
import LeadDetail from './LeadDetail';
import type { SpeakerLead, FilterOptions } from '../types';

// Mock data for demonstration
const mockLeads: SpeakerLead[] = [
  {
    id: '1',
    name: 'TechConf 2024',
    focus: 'AI & Machine Learning',
    contactType: 'Direct',
    industryCategory: 'Technology',
    engagementBrief: 'Looking for AI experts',
    addedDate: '2024-03-15',
    isUnlocked: false,
    eventPurpose: 'Annual technology conference focusing on AI advancements',
    hostOrganization: 'TechCorp International',
    targetAudience: 'Tech professionals, AI researchers, Industry leaders'
  },
  {
    id: '2',
    name: 'Finance Summit',
    focus: 'Digital Banking',
    contactType: 'Agency',
    industryCategory: 'Finance',
    engagementBrief: 'Digital transformation speakers needed',
    addedDate: '2024-03-14',
    isUnlocked: true,
    eventUrl: 'https://example.com/finance-summit',
    contactEmail: 'speakers@financesummit.com',
    eventPurpose: 'Exploring the future of digital banking',
    hostOrganization: 'Global Finance Institute',
    targetAudience: 'Banking executives, FinTech leaders'
  }
];

export default function Dashboard() {
  const [selectedLead, setSelectedLead] = useState<SpeakerLead | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    industry: '',
    company: '',
    eventName: '',
    role: '',
    location: ''
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Speaker Opportunities</h1>
        <p className="text-gray-600">Find and manage speaking engagements that match your expertise</p>
      </div>

      <div className="space-y-6">
        <SearchFilters filters={filters} setFilters={setFilters} />
        <LeadsTable leads={mockLeads} onLeadSelect={setSelectedLead} />
      </div>

      {selectedLead && (
        <LeadDetail
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}