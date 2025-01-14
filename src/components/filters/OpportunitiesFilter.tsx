import React, { useState } from 'react';
import { Search, RotateCcw, X } from 'lucide-react';

interface OpportunitiesFilterProps {
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export default function OpportunitiesFilter({ 
  value, 
  onChange, 
  onReset, 
  hasActiveFilters,
  tags,
  onAddTag,
  onRemoveTag 
}: OpportunitiesFilterProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      const newTag = value.trim();
      if (!tags.includes(newTag)) {
        onAddTag(newTag);
        onChange('');
      }
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <Search className="w-4 h-4 text-blue-600" />
        <label className="block text-sm font-semibold text-gray-900">
          Search Event Names And Topics
        </label>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
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
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 p-2 bg-gray-50 rounded-lg">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-white border border-gray-200 text-gray-700"
            >
              {tag}
              <button
                onClick={() => onRemoveTag(tag)}
                className="ml-1 p-0.5 hover:text-red-500 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-gray-500">
        Search across all available opportunities
      </p>
    </div>
  );
}