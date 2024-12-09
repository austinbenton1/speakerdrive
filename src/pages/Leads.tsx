import React, { useState } from 'react';
import { Star } from 'lucide-react';
import type { SpeakerLead } from '../types';

// Mock data for saved/starred leads
const savedLeads: SpeakerLead[] = [
  {
    id: '3',
    name: 'Healthcare Innovation Summit',
    focus: 'Digital Health',
    contactType: 'Direct',
    industryCategory: 'Healthcare',
    engagementBrief: 'Seeking speakers on healthcare technology',
    addedDate: '2024-03-10',
    isUnlocked: true,
    eventUrl: 'https://example.com/health-summit',
    contactEmail: 'speakers@healthsummit.com',
    eventPurpose: 'Discussing digital transformation in healthcare',
    hostOrganization: 'Healthcare Tech Association',
    targetAudience: 'Healthcare professionals, Technology leaders'
  }
];

export default function Leads() {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'contacted' | 'pending'>('all');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Leads</h1>
        <p className="text-gray-600">Manage your saved speaking opportunities</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            {['all', 'contacted', 'pending'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status as typeof selectedStatus)}
                className={`
                  relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-center text-sm font-medium
                  ${selectedStatus === status
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                  }
                `}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {savedLeads.map((lead) => (
            <div
              key={lead.id}
              className="flex items-center justify-between p-4 border-b border-gray-200 last:border-0"
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900">{lead.name}</h3>
                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                  <span>{lead.industryCategory}</span>
                  <span>•</span>
                  <span>{lead.focus}</span>
                  <span>•</span>
                  <span>{lead.addedDate}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-yellow-500 hover:text-yellow-600">
                  <Star className="w-5 h-5 fill-current" />
                </button>
                <button className="btn-primary">
                  View Details
                </button>
              </div>
            </div>
          ))}

          {savedLeads.length === 0 && (
            <div className="text-center py-12">
              <Star className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No saved leads</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start saving interesting opportunities to track them here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}