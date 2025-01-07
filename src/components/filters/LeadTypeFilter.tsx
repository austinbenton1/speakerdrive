import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip } from '../Tooltip';
import { LeadTypeTooltip } from '../tooltips/LeadTypeTooltip';
import { TargetAudienceTooltip } from '../tooltips/TargetAudienceTooltip';
import { JobTitleTooltip } from '../tooltips/JobTitleTooltip';
import FilterSearch from '../filters/FilterSearch';
import FilterSection from '../filters/FilterSection';
import type { FilterOptions } from '../../types';

interface LeadTypeFilterProps {
  selectedLeadTypes: string[];
  selectedEventUnlockTypes: string[];
  filters: FilterOptions;
  toggleLeadType: (type: string) => void;
  toggleEventUnlockType: (type: string) => void;
  setFilters: (fn: (prev: FilterOptions) => FilterOptions) => void;
}

export default function LeadTypeFilter({
  selectedLeadTypes,
  selectedEventUnlockTypes,
  filters,
  toggleLeadType,
  toggleEventUnlockType,
  setFilters,
}: LeadTypeFilterProps) {
  const showJobTitle = selectedLeadTypes.length === 1 && selectedLeadTypes[0] === 'Contacts';

  return (
    <div className="space-y-4 mb-4">
      {/* Lead Type */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="text-[14px] font-medium text-gray-700">
            Lead Type
          </label>
          <Tooltip content={<LeadTypeTooltip />} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {['Events', 'Contacts'].map((type) => (
            <button
              key={type}
              onClick={() => {
                toggleLeadType(type);
                if (type === 'Contacts') {
                  setFilters(prev => ({ ...prev, unlockType: 'Unlock Contact Email' }));
                }
              }}
              className={`
                relative px-3 py-1.5 text-[14px] font-medium rounded-md
                transition-all duration-150 border shadow-sm
                ${selectedLeadTypes.includes(type)
                  ? 'bg-white border-gray-200 text-gray-900'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center justify-center">
                <span>{type}</span>
                {selectedLeadTypes.includes(type) && (
                  <div className="absolute top-0 right-0 w-1.5 h-1.5 m-1">
                    <span className={`block w-1.5 h-1.5 rounded-full ${type === 'Events' ? 'bg-[#00B341]' : 'bg-[#0066FF]'}`}></span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
        <p className="mt-1 text-[14px] text-gray-500">
          {selectedLeadTypes.length === 2 
            ? "Showing all lead types" 
            : `Showing only ${selectedLeadTypes.join(", ")}`}
        </p>
      </div>

      {/* Job Title Search */}
      {showJobTitle && (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className="text-[14px] font-medium text-gray-700">
              Contacts → Job Title
            </label>
            <Tooltip content={<JobTitleTooltip />} />
          </div>
          <FilterSearch
            value={filters.jobTitle}
            onChange={(value) => setFilters(prev => ({ ...prev, jobTitle: value }))}
            placeholder="Search job title..."
          />
        </div>
      )}

      {/* Target Audience Search */}
      {selectedLeadTypes.length === 1 && selectedLeadTypes[0] === 'Events' && (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className="text-[14px] font-medium text-gray-700">
              Events → Target Audience
            </label>
            <Tooltip content={<TargetAudienceTooltip />} />
          </div>
          <FilterSearch
            value={filters.targetAudience}
            onChange={(value) => setFilters(prev => ({ ...prev, targetAudience: value }))}
            placeholder="Search target audience..."
          />
        </div>
      )}
    </div>
  );
}