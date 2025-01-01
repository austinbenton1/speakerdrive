import React from 'react';
import FilterSection from './FilterSection';
import FilterSearch from './FilterSearch';
import OpportunitiesFilter from './OpportunitiesFilter';
import LocationFilter from './LocationFilter';
import EventFormatFilter from './EventFormatFilter';
import OrganizationTypeFilter from './OrganizationTypeFilter';
import IndustryQuickFilters from './IndustryQuickFilters';
import type { FilterOptions } from '../../types';

interface LeftSidebarFiltersProps {
  filters: FilterOptions;
  openSections: Record<string, boolean>;
  eventsFilter: string;
  onEventsFilterChange: (value: string) => void;
  setFilters: (fn: (prev: FilterOptions) => FilterOptions) => void;
  toggleSection: (section: string) => void;
}

export default function LeftSidebarFilters({
  filters,
  openSections,
  eventsFilter,
  onEventsFilterChange,
  setFilters,
  toggleSection
}: LeftSidebarFiltersProps) {
  return (
    <div className="w-64 bg-white p-4 overflow-y-auto">
      <div className="space-y-8">
        <div className="pt-2">
          <OpportunitiesFilter
            value={eventsFilter}
            onChange={onEventsFilterChange}
          />
        </div>

        <div className="space-y-6">
          <EventFormatFilter
            selectedFormats={filters.eventFormat}
            onFormatSelect={(format) => {
              setFilters(prev => ({
                ...prev,
                eventFormat: prev.eventFormat.includes(format)
                  ? prev.eventFormat.filter(f => f !== format)
                  : [...prev.eventFormat, format],
              }));
            }}
            isOpen={openSections.eventFormat}
            onToggle={() => toggleSection('eventFormat')}
            onUnselectAll={() => setFilters(prev => ({ ...prev, eventFormat: [] }))}
          />

          <FilterSection
            title="Industry Category"
            isOpen={openSections.industry}
            onToggle={() => toggleSection('industry')}
          >
            <IndustryQuickFilters
              selectedIndustries={filters.industry}
              onIndustrySelect={(industry) => {
                const newIndustries = filters.industry.includes(industry)
                  ? filters.industry.filter(i => i !== industry)
                  : [...filters.industry, industry];
                setFilters(prev => ({ ...prev, industry: newIndustries }));
              }}
              onShowMore={() => toggleSection('industry')}
            />
          </FilterSection>

          <LocationFilter
            selectedLocations={filters.location}
            onLocationSelect={(location) => {
              setFilters(prev => ({
                ...prev,
                location: prev.location.includes(location)
                  ? prev.location.filter(l => l !== location)
                  : [...prev.location, location]
              }));
            }}
            isOpen={openSections.location}
            onToggle={() => toggleSection('location')}
          />

          <OrganizationTypeFilter
            selectedOrgTypes={filters.organizationType}
            onOrgTypeSelect={(orgType) => {
              setFilters(prev => ({
                ...prev,
                organizationType: prev.organizationType.includes(orgType)
                  ? prev.organizationType.filter(t => t !== orgType)
                  : [...prev.organizationType, orgType],
              }));
            }}
            isOpen={openSections.organizationType}
            onToggle={() => toggleSection('organizationType')}
            onUnselectAll={() => setFilters(prev => ({ ...prev, organizationType: [] }))}
          />

          <FilterSection
            title="Additional Filters"
            isOpen={openSections.moreFilters}
            onToggle={() => toggleSection('moreFilters')}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Organization
                </label>
                <FilterSearch
                  value={filters.organization}
                  onChange={(value) => setFilters(prev => ({ ...prev, organization: value }))}
                  placeholder="Search organizations..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Past Speakers
                </label>
                <FilterSearch
                  value={filters.pastSpeakers}
                  onChange={(value) => setFilters(prev => ({ ...prev, pastSpeakers: value }))}
                  placeholder="Search past speakers..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Search All
                </label>
                <FilterSearch
                  value={filters.searchAll}
                  onChange={(value) => setFilters(prev => ({ ...prev, searchAll: value }))}
                  placeholder="Search all fields..."
                />
              </div>
            </div>
          </FilterSection>
        </div>
      </div>
    </div>
  );
}