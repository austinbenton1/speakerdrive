import React from 'react';
import { Eye, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-gray-400" />
          <span className="font-medium">Views</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-3 pt-2 pb-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Event Display</span>
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
            checked={showAllEvents}
            onChange={onToggle}
            leftLabel="Unique"
            rightLabel="All"
          />
          
          <div className="space-y-1">
            <p className="text-xs text-gray-500">
              {!showAllEvents 
                ? 'Showing unique events'
                : 'Showing all event unlocks'
              }
            </p>
            <p className="text-xs text-gray-400">
              {!showAllEvents 
                ? `${uniqueCount} total events`
                : `${totalCount} total leads`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}