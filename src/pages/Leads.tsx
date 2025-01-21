import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Loader } from 'lucide-react';
import { useUnlockedLeads } from '../hooks/useUnlockedLeads';
import UnlockedLeadsList from '../components/leads/UnlockedLeadsList';

export default function Leads() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const { leads, loading, error } = useUnlockedLeads();

  const filteredLeads = leads.filter(lead => {
    if (!searchQuery) return true;
    const searchTerms = searchQuery.toLowerCase().split(' ');
    return searchTerms.every(term => {
      const searchableFields = [
        lead.event_name || '',
        lead.industry || '',
        lead.focus || '',
        lead.subtext || ''
      ];
      return searchableFields.some(field => 
        field.toLowerCase().includes(term)
      );
    });
  });

  const handleLeadClick = async (leadId: string) => {
    const currentPath = location.pathname;
    const currentSearch = location.search;

    navigate(`/leads/${leadId}`, {
      state: {
        fromUnlockedLeads: true,
        leadIds: filteredLeads.map(lead => lead.id),
        currentIndex: filteredLeads.findIndex(lead => lead.id === leadId),
        returnPath: `${currentPath}${currentSearch}`
      }
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Leads</h1>
        <p className="text-gray-600">Manage your unlocked speaking opportunities</p>
      </div>

      <div className="bg-white rounded-lg shadow">
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