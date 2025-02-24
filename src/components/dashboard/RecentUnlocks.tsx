import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, Calendar, Users, Filter } from 'lucide-react';
import { useUnlockedLeadsData } from '../../hooks/useUnlockedLeadsData';
import { getUnlockedLeads } from '../../utils/leads';
import RecentUnlockItem from './RecentUnlockItem';
import LoadingSpinner from '../common/LoadingSpinner';

export default function RecentUnlocks() {
  const { recordedLeads, loading, error } = useUnlockedLeadsData();
  const [filter, setFilter] = useState<'all' | 'events' | 'contacts'>('all');

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

  // Get only unlocked leads and filter by type if needed
  const unlockedLeads = getUnlockedLeads(recordedLeads)
    .filter(lead => filter === 'all' || 
      (filter === 'events' && lead.lead_type === 'Event') ||
      (filter === 'contacts' && lead.lead_type === 'Contact')
    )
    .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
    .slice(0, 10);

  if (!unlockedLeads.length) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col items-start space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Unlocked Leads</h2>
          <div className="mt-4 flex justify-center">
            <FilterTabs filter={filter} setFilter={setFilter} />
          </div>
        </div>
        <div className="text-center py-8">
          <Star className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {filter === 'all' 
              ? 'No unlocked leads' 
              : `No unlocked ${filter.slice(0, -1)} leads`}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all'
              ? 'Start unlocking leads to track them here'
              : `Switch filters or unlock more ${filter} to see them here`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Recent Unlocked Leads</h2>
            <p className="text-sm text-gray-500 mt-0.5">Last 10 unlocked leads</p>
          </div>
          <Link 
            to="/find-leads" 
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="mt-4 flex justify-left">
          <FilterTabs filter={filter} setFilter={setFilter} />
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {unlockedLeads.map((lead) => (
          <RecentUnlockItem key={`${lead.lead_id}-${lead.unlocked_at}`} lead={lead} />
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

function FilterTabs({ 
  filter, 
  setFilter 
}: { 
  filter: 'all' | 'events' | 'contacts';
  setFilter: (filter: 'all' | 'events' | 'contacts') => void;
}) {
  return (
    <div className="inline-flex items-center bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => setFilter('all')}
        className={`
          flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors
          ${filter === 'all' 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-500 hover:text-gray-900'
          }
        `}
      >
        <Filter className="w-4 h-4 mr-1.5" />
        All
      </button>
      <button
        onClick={() => setFilter('events')}
        className={`
          flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors
          ${filter === 'events'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-900'
          }
        `}
      >
        <Calendar className="w-4 h-4 mr-1.5" />
        Events
      </button>
      <button
        onClick={() => setFilter('contacts')}
        className={`
          flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors
          ${filter === 'contacts'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-900'
          }
        `}
      >
        <Users className="w-4 h-4 mr-1.5" />
        Contacts
      </button>
    </div>
  );
}