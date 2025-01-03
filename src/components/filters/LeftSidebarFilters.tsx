import React from 'react';
import { Calendar, Building2, MapPin, Users, Filter, Briefcase } from 'lucide-react';
import FilterHeader from './FilterHeader';
import FilterSection from './FilterSection';
import FilterSearch from './FilterSearch';
import MultiSelect from './MultiSelect';
import { eventFormats, locations, organizationTypes, industries } from '../../constants/filters';
import type { FilterOptions, OpenSections } from '../../types';

interface LeftSidebarFiltersProps {
  filters: FilterOptions;
  openSections: OpenSections;
  setFilters: (filters: FilterOptions) => void;
  setOpenSections: (sections: OpenSections) => void;
  toggleSection: (section: string) => void;
  selectedUnlockType?: string | null;
}

export default function LeftSidebarFilters({
  filters,
  openSections,
  setFilters,
  setOpenSections,
  toggleSection,
  selectedUnlockType
}: LeftSidebarFiltersProps) {
  return (
    <div className="w-64 bg-white p-4 overflow-y-auto border-r border-gray-200">
      <div className="space-y-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-500" />
            <label className="block text-sm font-semibold text-gray-900">
              Target Audience
            </label>
          </div>
          <input
            type="text"
            value={filters.targetAudience || ''}
            onChange={(e) => setFilters({ ...filters, targetAudience: e.target.value })}
            placeholder="e.g. Software Engineers, CTOs..."
            className="block w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm 
              placeholder:text-gray-400
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
              hover:border-gray-300 transition-all duration-300"
          />
        </div>

        {selectedUnlockType === 'Unlock Contact Email' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-gray-500" />
              <label className="block text-sm font-semibold text-gray-900">
                Job Title
              </label>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                Contact
              </span>
            </div>
            <input
              type="text"
              value={filters.jobTitle || ''}
              onChange={(e) => setFilters({ ...filters, jobTitle: e.target.value })}
              placeholder="e.g. CTO, Engineering Manager..."
              className="block w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm 
                placeholder:text-gray-400
                focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                hover:border-gray-300 transition-all duration-300"
            />
          </div>
        )}
      </div>

      <div className="h-px bg-gray-200 mb-6" />

      <FilterHeader />
      
      <div className="space-y-1">
        <FilterSection
          title="Event Format"
          icon={Calendar}
          isOpen={openSections.eventFormat}
          onToggle={() => toggleSection('eventFormat')}
          onUnselectAll={() => setFilters({ ...filters, eventFormat: [] })}
          showUnselectAll={filters.eventFormat.length > 0}
        >
          <MultiSelect
            options={eventFormats}
            selected={filters.eventFormat}
            onChange={(format) => {
              setFilters({
                ...filters,
                eventFormat: filters.eventFormat.includes(format)
                  ? filters.eventFormat.filter(f => f !== format)
                  : [...filters.eventFormat, format],
              });
            }}
          />
        </FilterSection>

        <FilterSection
          title="Industry Category"
          icon={Building2}
          isOpen={openSections.industry}
          onToggle={() => toggleSection('industry')}
          onUnselectAll={() => setFilters({ ...filters, industry: [] })}
          showUnselectAll={filters.industry.length > 0}
        >
          <MultiSelect
            options={industries}
            selected={filters.industry}
            onChange={(industry) => {
              setFilters({
                ...filters,
                industry: filters.industry.includes(industry)
                  ? filters.industry.filter(i => i !== industry)
                  : [...filters.industry, industry]
              });
            }}
          />
        </FilterSection>

        <FilterSection
          title="Location"
          icon={MapPin}
          isOpen={openSections.location}
          onToggle={() => toggleSection('location')}
          onUnselectAll={() => setFilters({ ...filters, location: [] })}
          showUnselectAll={filters.location.length > 0}
        >
          <MultiSelect
            options={locations}
            selected={filters.location}
            onChange={(location) => {
              setFilters({
                ...filters,
                location: filters.location.includes(location)
                  ? filters.location.filter(l => l !== location)
                  : [...filters.location, location]
              });
            }}
          />
        </FilterSection>

        <FilterSection
          title="Organization Type"
          icon={Users}
          isOpen={openSections.organizationType}
          onToggle={() => toggleSection('organizationType')}
          onUnselectAll={() => setFilters({ ...filters, organizationType: [] })}
          showUnselectAll={filters.organizationType.length > 0}
        >
          <MultiSelect
            options={organizationTypes}
            selected={filters.organizationType}
            onChange={(orgType) => {
              setFilters({
                ...filters,
                organizationType: filters.organizationType.includes(orgType)
                  ? filters.organizationType.filter(t => t !== orgType)
                  : [...filters.organizationType, orgType],
              });
            }}
          />
        </FilterSection>

        <FilterSection
          title="Additional Filters"
          icon={Filter}
          isOpen={openSections.moreFilters}
          onToggle={() => toggleSection('moreFilters')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization
              </label>
              <FilterSearch
                value={filters.organization}
                onChange={(value) => setFilters({ ...filters, organization: value })}
                placeholder="Search organizations..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Past Speakers
              </label>
              <FilterSearch
                value={filters.pastSpeakers}
                onChange={(value) => setFilters({ ...filters, pastSpeakers: value })}
                placeholder="Search past speakers..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search All
              </label>
              <FilterSearch
                value={filters.searchAll}
                onChange={(value) => setFilters({ ...filters, searchAll: value })}
                placeholder="Search all fields..."
              />
            </div>
          </div>
        </FilterSection>
      </div>
    </div>
  );
}