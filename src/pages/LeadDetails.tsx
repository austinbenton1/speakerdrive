import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLeadDetails } from '../hooks/useLeadDetails';
import LeadDetailHeader from '../components/leads/LeadDetailHeader';
import LeadDetailContent from '../components/leads/LeadDetailContent';
import LeadDetailSidebar from '../components/leads/LeadDetailSidebar';
import { AlertCircle, Loader } from 'lucide-react';

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lead, isLoading, error } = useLeadDetails(id || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="mt-2 text-sm text-gray-600">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Error Loading Lead</h2>
          <p className="text-sm text-gray-500 mb-4">{error.message}</p>
          <button
            onClick={() => navigate('/find-leads')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
          >
            Back to Lead Finder
          </button>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Lead not found</h2>
          <p className="text-sm text-gray-500 mb-4">The lead you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/find-leads')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
          >
            Back to Lead Finder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LeadDetailHeader lead={lead} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 gap-8">
          <LeadDetailContent lead={lead} />
          <LeadDetailSidebar lead={lead} />
        </div>
      </div>
    </div>
  );
}