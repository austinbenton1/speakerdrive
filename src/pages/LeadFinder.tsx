import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader } from 'lucide-react';
import { useAvailableLeads } from '../hooks/useAvailableLeads';
import LeadsTable from '../components/leads/LeadsTable';
import SearchContainer from '../components/SearchContainer';
import QuickStartGuide from '../components/QuickStartGuide';

export default function LeadFinder() {
  const navigate = useNavigate();
  const { leads, loading, error } = useAvailableLeads();
  const [showGuide, setShowGuide] = React.useState(true);

  const handleLeadClick = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="mt-2 text-sm text-gray-600">Loading available leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Error Loading Leads</h2>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {showGuide && (
        <QuickStartGuide onDismiss={() => setShowGuide(false)} />
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Lead Finder</h1>
        <p className="text-gray-600">
          Discover new speaking opportunities that match your expertise
        </p>
      </div>

      <SearchContainer>
        <div className="space-y-4">
          <h3 className="text-[14px] font-medium text-gray-700">
            Available Leads
          </h3>
          <p className="text-sm text-gray-500">
            {leads.length} leads available for unlock
          </p>
        </div>
      </SearchContainer>

      <div className="mt-6">
        <LeadsTable 
          leads={leads}
          onLeadClick={handleLeadClick}
        />
      </div>
    </div>
  );
}