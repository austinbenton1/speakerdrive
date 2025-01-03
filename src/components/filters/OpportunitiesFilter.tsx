import React from 'react';
import { Search } from 'lucide-react';

interface OpportunitiesFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export default function OpportunitiesFilter({ value, onChange }: OpportunitiesFilterProps) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <Search className="w-4 h-4 text-blue-600" />
        <label className="block text-sm font-semibold text-gray-900">
          Search Events
        </label>
      </div>
      <div className="relative group">
        <div className="absolute inset-0 bg-blue-100/50 rounded-lg -m-1 transition-all duration-300 opacity-0 group-hover:opacity-100" />
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. Leadership Summit, Tech Conference..."
            className="block w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-lg text-sm 
              placeholder:text-gray-400 shadow-sm
              focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20
              hover:border-gray-300 transition-all duration-300"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-gray-100/80 rounded text-xs font-medium text-gray-500">
            Search
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Search across all available speaking opportunities
      </p>
    </div>
  );
}