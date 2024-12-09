import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FilterSectionProps {
  title: string | React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  onUnselectAll?: () => void;
  showUnselectAll?: boolean;
}

export default function FilterSection({ 
  title, 
  isOpen, 
  onToggle, 
  children,
  onUnselectAll,
  showUnselectAll = false
}: FilterSectionProps) {
  return (
    <div className="mb-3">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-[14px] font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="mt-2 space-y-2">
          {children}
          {showUnselectAll && onUnselectAll && (
            <button
              onClick={onUnselectAll}
              className="w-full px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              Unselect All
            </button>
          )}
        </div>
      )}
    </div>
  );
}