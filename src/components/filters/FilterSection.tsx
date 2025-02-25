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
    <div className="mb-0.5">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 group text-left cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-700 transition-colors flex-shrink-0" />
          <div className="flex items-center gap-1">
            <span className="font-medium text-[14px]">{title}</span>
            {tooltip && (
              <Tooltip content={tooltip}>
                <span className="inline-flex">
                  <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                </span>
              </Tooltip>
            )}
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
        )}
      </button>
      
      {isOpen && (
        <div 
          className="mt-1 space-y-1 px-2 py-1 bg-gray-50/50 rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
          {showUnselectAll && onUnselectAll && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUnselectAll();
              }}
              className="w-full px-2.5 py-1 text-xs text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 active:bg-gray-100 rounded-md transition-colors border border-gray-200"
            >
              Unselect All
            </button>
          )}
        </div>
      )}
    </div>
  );
}