import React from 'react';
import { Eye } from 'lucide-react';
import OutlinedToggle from '../common/OutlinedToggle';

interface ViewsSectionProps {
  showAllEvents: boolean;
  onToggle: () => void;
  totalCount: number;
  uniqueCount: number;
}

export default function ViewsSection({ 
  showAllEvents, 
  onToggle,
  totalCount,
  uniqueCount 
}: ViewsSectionProps) {
  return (
    <div>
      <div className="pl-2 mb-4">
        <h2 className="text-sm font-medium tracking-wide text-gray-500 uppercase">
          Views
        </h2>
      </div>
      
      <div className="px-3 space-y-2">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Event Display</span>
        </div>

        <OutlinedToggle
          checked={!showAllEvents}
          onChange={onToggle}
        />
        
        <div className="space-y-1">
          <p className="text-xs text-gray-500">
            {showAllEvents 
              ? 'Showing all event leads'
              : 'Showing one lead per event'
            }
          </p>
          <p className="text-xs text-gray-400">
            {showAllEvents 
              ? `${totalCount} total leads`
              : `${uniqueCount} unique leads`
            }
          </p>
        </div>
      </div>
    </div>
  );
}