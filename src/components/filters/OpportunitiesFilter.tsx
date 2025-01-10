import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

interface OpportunitiesFilterProps {
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export default function OpportunitiesFilter({ value, onChange, onReset, hasActiveFilters }: OpportunitiesFilterProps) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <Search className="w-4 h-4 text-blue-600" />
        <label className="block text-sm font-semibold text-gray-900">
          Search Event Name, Keywords, and Target Audience
        </label>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="e.g. Leadership Summit, Tech Conference..."
              className="block w-full px-4 pr-16 py-3.5 bg-white border-2 border-gray-200 rounded-lg text-sm 
                placeholder:text-gray-400 shadow-sm
                focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20
                hover:border-gray-300 transition-all duration-300"
            />
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-gray-100/80 rounded text-xs font-medium text-gray-500">
            Search
          </div>
        </div>
        <div className="shrink-0 w-[116px]">
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="w-full inline-flex items-center justify-center gap-1 px-3 py-4 bg-white border-2 border-red-100 rounded-lg text-xs 
                font-medium text-red-500/80 shadow-sm 
                focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-300 
                transition-all duration-300"
              aria-label="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filter
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Search across all available opportunities
      </p>
    </div>
  );
}