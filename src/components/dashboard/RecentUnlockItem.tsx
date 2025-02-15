import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, Calendar, Users } from 'lucide-react';
import { formatRelativeTime } from '../../utils/date';
import type { RecordedLead } from '../../types/leads';

interface RecentUnlockItemProps {
  lead: RecordedLead;
}

export default function RecentUnlockItem({ lead }: RecentUnlockItemProps) {
  const navigate = useNavigate();

  const LeadIcon = lead.lead_type === 'Event' ? Calendar : Users;

  return (
    <div 
      onClick={() => navigate(`/leads/${lead.lead_id}`)}
      className="flex items-stretch gap-3 hover:bg-gray-50 cursor-pointer transition-colors rounded-lg px-3 group"
    >
      <div className="flex-shrink-0 pt-4 pb-3">
        {lead.image_url ? (
          <img
            src={lead.image_url}
            alt={lead.event_name}
            className="w-14 h-14 rounded-md object-cover border border-gray-200"
          />
        ) : (
          <div className="w-14 h-14 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
            <LeadIcon className="w-6 h-6 text-gray-400" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 py-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
            {lead.event_name}
          </p>
          <span className="text-xs font-medium text-gray-500 flex-shrink-0">
            {formatRelativeTime(new Date(lead.unlocked_at))}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 sm:mb-0 mb-0">
          <div className="flex items-center text-xs text-gray-500 min-w-0">
            <Building2 className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
            <span className="truncate max-w-[200px]">
              {lead.subtext || 'No description'}
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 flex-shrink-0">
            {lead.industry || 'Uncategorized'}
          </span>
        </div>
        <div className="sm:hidden mt-[1px]">
          <span className="inline-flex items-center px-1.5 py-px rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
            {lead.industry || 'Uncategorized'}
          </span>
        </div>
      </div>
    </div>
  );
}