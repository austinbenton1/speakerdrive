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
      <h2 className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Views
      </h2>
      
      <div className="px-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Event Display</span>
          </div>
          <a 
            href="https://google.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap"
          >
            Learn more
          </a>
        </div>

        <OutlinedToggle
          checked={!showAllEvents}
          onChange={onToggle}
        />
        
        <div className="space-y-1">
          <p className="text-xs text-gray-500">
            {showAllEvents 
              ? 'Showing all event leads'
              : 'Showing unique leads'
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