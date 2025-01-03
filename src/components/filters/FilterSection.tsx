import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface FilterSectionProps {
  title: string;
  icon: LucideIcon;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  onUnselectAll?: () => void;
  showUnselectAll?: boolean;
}

export default function FilterSection({ 
  title, 
  icon: Icon,
  isOpen, 
  onToggle, 
  children,
  onUnselectAll,
  showUnselectAll = false
}: FilterSectionProps) {
  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500" />
          <span className="font-medium">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      
      {isOpen && (
        <div className="mt-2 space-y-2 pl-3">
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