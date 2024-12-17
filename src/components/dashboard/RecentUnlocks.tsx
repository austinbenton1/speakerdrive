import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { useUnlockedLeadsData } from '../../hooks/useUnlockedLeadsData';
import { getUnlockedLeads } from '../../utils/leads';
import RecentUnlockItem from './RecentUnlockItem';
import LoadingSpinner from '../common/LoadingSpinner';

export default function RecentUnlocks() {
  const { recordedLeads, loading, error } = useUnlockedLeadsData();

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Unlocked Leads</h2>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Unlocked Leads</h2>
        <div className="text-center py-8">
          <p className="text-sm text-red-600">Failed to load recent unlocks</p>
        </div>
      </div>
    );
  }

  // Get only unlocked leads and take the 10 most recent
  const unlockedLeads = getUnlockedLeads(recordedLeads)
    .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
    .slice(0, 10);

  if (!unlockedLeads.length) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Unlocked Leads</h2>
        <div className="text-center py-8">
          <Star className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No unlocked leads</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start unlocking leads to track them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Recent Unlocked Leads</h2>
        <Link 
          to="/leads" 
          className="group inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View all
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div className="divide-y divide-gray-200">
        {unlockedLeads.map((lead) => (
          <RecentUnlockItem key={`${lead.lead_name}-${lead.unlocked_at}`} lead={lead} />
        ))}
      </div>
      
      {/* Bottom link for mobile */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-center sm:hidden">
        <Link 
          to="/leads" 
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View all unlocked leads
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}