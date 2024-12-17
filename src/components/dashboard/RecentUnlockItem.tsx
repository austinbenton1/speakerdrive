import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '../../utils/date';
import type { RecordedLead } from '../../types/leads';

interface RecentUnlockItemProps {
  lead: RecordedLead;
}

export default function RecentUnlockItem({ lead }: RecentUnlockItemProps) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/leads/${lead.lead_id}`)}
      className="flex items-center justify-between py-3 hover:bg-gray-50 cursor-pointer transition-colors rounded-lg px-2"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">{lead.lead_name}</p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-500 truncate">{lead.focus}</p>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {lead.lead_type}
          </span>
        </div>
      </div>
      <div className="ml-4 flex-shrink-0">
        <span className="text-xs text-gray-500">
          {formatRelativeTime(new Date(lead.unlocked_at))}
        </span>
      </div>
    </div>
  );
}