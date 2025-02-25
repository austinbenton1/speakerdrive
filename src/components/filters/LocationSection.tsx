import React from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import OutlinedToggle from '../common/OutlinedToggle';

interface LocationSectionProps {
  showAll: boolean;
  onToggle: () => void;
  totalCount: number;
  usaCount: number;
}

export default function LocationSection({ 
  showAll, 
  onToggle,
  totalCount,
  usaCount 
}: LocationSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-medium">Location</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>

      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-2.5 pt-1.5 pb-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-gray-700 whitespace-nowrap">Location Filter</span>
            <a 
              href="https://google.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap"
            >
              Learn more
            </a>
          </div>

          <div className="flex items-center gap-2">
            <OutlinedToggle
              checked={showAll}
              onChange={onToggle}
              leftLabel="USA"
              rightLabel="All"
            />
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-gray-500">
              {showAll 
                ? 'Showing all locations'
                : 'Showing USA locations only'
              }
            </p>
            <p className="text-xs text-gray-400">
              {showAll 
                ? `${totalCount} total leads`
                : `${usaCount} USA leads`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
