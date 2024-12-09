import React from 'react';
import { Search } from 'lucide-react';

interface OpportunitiesFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export default function OpportunitiesFilter({ value, onChange }: OpportunitiesFilterProps) {
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Opportunities
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search opportunities..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40"
        />
      </div>
    </div>
  );
}