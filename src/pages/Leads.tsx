import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader } from 'lucide-react';
import { useUnlockedLeads } from '../hooks/useUnlockedLeads';
import UnlockedLeadsList from '../components/leads/UnlockedLeadsList';

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'pending', label: 'Pending' },
];

export default function Leads() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { leads, loading, error } = useUnlockedLeads();

  const filteredLeads = leads.filter(lead => {
    if (!searchQuery) return true;
    const searchTerms = searchQuery.toLowerCase().split(' ');
    return searchTerms.every(term =>
      lead.name.toLowerCase().includes(term) ||
      lead.industry.toLowerCase().includes(term) ||
      lead.focus.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Leads</h1>
        <p className="text-gray-600">Manage your unlocked speaking opportunities</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-center text-sm font-medium
                  ${activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4">
          <div className="max-w-md mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search unlocked leads..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={() => navigate('/find-leads')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Find New Leads
              </button>
            </div>
          ) : (
            <UnlockedLeadsList leads={filteredLeads} />
          )}
        </div>
      </div>
    </div>
  );
}