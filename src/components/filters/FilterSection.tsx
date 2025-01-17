import React from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

interface FilterSectionProps {
  title: string;
  icon: LucideIcon;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  onUnselectAll?: () => void;
  showUnselectAll?: boolean;
  tooltip?: React.ReactNode;
}

export default function FilterSection({ 
  title, 
  icon: Icon,
  isOpen, 
  onToggle, 
  children,
  onUnselectAll,
  showUnselectAll = false,
  tooltip
}: FilterSectionProps) {
  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 rounded-lg 
          hover:bg-gray-50 transition-all duration-200 group"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
          <div className="flex items-center gap-1">
            <span className="font-medium">{title}</span>
            {tooltip && (
              <Tooltip content={tooltip}>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </Tooltip>
            )}
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        )}
      </button>
      
      {isOpen && (
        <div className="mt-2 space-y-2 px-3 py-2 bg-gray-50/50 rounded-lg">
          {children}
          {showUnselectAll && onUnselectAll && (
            <button
              onClick={onUnselectAll}
              className="w-full px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 
                bg-white hover:bg-gray-50 rounded-md transition-colors border border-gray-200"
            >
              Unselect All
            </button>
          )}
        </div>
      )}
    </div>
  );
}