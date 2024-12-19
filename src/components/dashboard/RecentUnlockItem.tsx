import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '../../utils/date';
import { Building2, User } from 'lucide-react';
import type { RecordedLead } from '../../types/leads';

interface RecentUnlockItemProps {
  lead: RecordedLead;
}

export default function RecentUnlockItem({ lead }: RecentUnlockItemProps) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/leads/${lead.lead_id}`)}
      className="flex items-stretch gap-3 hover:bg-gray-50 cursor-pointer transition-colors rounded-lg px-3 group"
    >
      <div className="flex-shrink-0 py-2">
        {lead.image_url ? (
          <img
            src={lead.image_url}
            alt={lead.lead_name}
            className="w-14 h-14 rounded-md object-cover border border-gray-200"
          />
        ) : (
          <div className="w-14 h-14 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
            <User className="w-6 h-6 text-gray-400" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 py-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
            {lead.lead_name}
          </p>
          <span className="text-xs font-medium text-gray-500">
            {formatRelativeTime(new Date(lead.unlocked_at))}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center text-xs text-gray-500">
            <Building2 className="w-3.5 h-3.5 mr-1" />
            {lead.organization || 'No organization'}
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            {lead.industry || 'Uncategorized'}
          </span>
        </div>
      </div>
    </div>
  );
}