import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import type { FilterOptions } from '../../types';

interface SmartFiltersBarProps {
  filters: FilterOptions;
  onRemoveFilter: (key: keyof FilterOptions, value: string) => void;
  onClearAllFilters: () => void;
}

export default function SmartFiltersBar({ 
  filters, 
  onRemoveFilter,
  onClearAllFilters 
}: SmartFiltersBarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Get active filters as chips
  const getActiveFilterChips = () => {
    const chips = [];
    
    // Helper function to safely handle array or string values
    const addFilterChips = (
      key: keyof FilterOptions,
      label: string,
      value: string | string[] | undefined
    ) => {
      if (!value) return;
      
      if (Array.isArray(value)) {
        value.forEach(v => {
          chips.push({
            key,
            value: v,
            label: `${label}: ${v}`
          });
        });
      } else if (typeof value === 'string' && value.trim()) {
        chips.push({
          key,
          value,
          label: `${label}: ${value}`
        });
      }
    };

    // Add industry filters
    addFilterChips('industry', 'Industry', filters.industry);

    // Add event format filters
    addFilterChips('eventFormat', 'Format', filters.eventFormat);

    // Add organization filters
    addFilterChips('organization', 'Organization', filters.organization);

    // Add organization type filters
    addFilterChips('organizationType', 'Organization Type', filters.organizationType);

    // Add location filters
    addFilterChips('region', 'Region', filters.region);
    addFilterChips('state', 'State', filters.state);
    addFilterChips('city', 'City', filters.city);

    // Add job title filters
    addFilterChips('jobTitle', 'Job Title', filters.jobTitle);

    return chips;
  };

  const activeChips = getActiveFilterChips();
  const hasActiveFilters = activeChips.length > 0;

  if (!hasActiveFilters) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4">
      <div className="px-4 py-2 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isCollapsed ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronUp className="w-5 h-5" />
            )}
          </button>
          <span className="text-sm font-medium text-gray-700">Active Filters</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {activeChips.length}
          </span>
        </div>
        <button
          onClick={onClearAllFilters}
          className="text-sm text-red-600 hover:text-red-700 transition-colors"
        >
          Clear all
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-4 flex flex-wrap gap-2">
          {activeChips.map((chip, index) => (
            <div
              key={`${chip.key}-${index}`}
              className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm border border-gray-200 shadow-sm"
            >
              <span>{chip.label}</span>
              <button
                onClick={() => onRemoveFilter(chip.key as keyof FilterOptions, chip.value)}
                className="p-0.5 hover:text-red-500 rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}