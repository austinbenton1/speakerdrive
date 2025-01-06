import React from 'react';
import { Calendar, Building2, MapPin, Users, Filter, Briefcase, Search } from 'lucide-react';
import FilterHeader from './FilterHeader';
import FilterSection from './FilterSection';
import FilterSearch from './FilterSearch';
import MultiSelect from './MultiSelect';
import ViewsSection from './ViewsSection';
import { eventFormats, locations, organizationTypes, industries } from '../../constants/filters';
import type { FilterOptions, OpenSections } from '../../types';

interface LeftSidebarFiltersProps {
  filters: FilterOptions;
  openSections: OpenSections;
  setFilters: (filters: FilterOptions) => void;
  setOpenSections: (sections: OpenSections) => void;
  toggleSection: (section: string) => void;
  selectedUnlockType?: string | null;
  showAllEvents?: boolean;
  onViewToggle?: () => void;
  totalCount?: number;
  uniqueCount?: number;
}

export default function LeftSidebarFilters({
  filters,
  openSections,
  setFilters,
  setOpenSections,
  toggleSection,
  selectedUnlockType,
  showAllEvents = true,
  onViewToggle,
  totalCount = 0,
  uniqueCount = 0
}: LeftSidebarFiltersProps) {
  return (
    <div className="w-64 bg-white overflow-y-auto border-r border-gray-200 flex flex-col h-full">
      {/* Main Content Area */}
      <div className="flex-1 p-5 space-y-6">
        {/* Event Filters Label */}
        <FilterHeader />

        {/* Primary Filters */}
        <div className="space-y-4">
          <FilterSection
            title="Target Audience"
            icon={Users}
            isOpen={true}
            onToggle={() => {}}
          >
            <input
              type="text"
              value={filters.targetAudience || ''}
              onChange={(e) => setFilters({ ...filters, targetAudience: e.target.value })}
              placeholder="e.g. Software Engineers, CTOs..."
              className="block w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm 
                placeholder:text-gray-400
                focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                hover:border-gray-300 transition-all duration-300"
            />
          </FilterSection>

          {selectedUnlockType === 'Unlock Contact Email' && (
            <FilterSection
              title="Job Title"
              icon={Briefcase}
              isOpen={true}
              onToggle={() => {}}
            >
              <input
                type="text"
                value={filters.jobTitle || ''}
                onChange={(e) => setFilters({ ...filters, jobTitle: e.target.value })}
                placeholder="e.g. CTO, Engineering Manager..."
                className="block w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm 
                  placeholder:text-gray-400
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                  hover:border-gray-300 transition-all duration-300"
              />
            </FilterSection>
          )}
        </div>

        {/* Event Details Filters */}
        <div className="space-y-4">
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
        </div>

        {/* Past Speakers Section */}
        <div className="space-y-4">
          <FilterSection
            title="Past Speakers"
            icon={Search}
            isOpen={openSections.pastSpeakers}
            onToggle={() => toggleSection('pastSpeakers')}
          >
            <FilterSearch
              value={filters.pastSpeakers}
              onChange={(value) => setFilters({ ...filters, pastSpeakers: value })}
              placeholder="Search past speakers..."
            />
          </FilterSection>
        </div>

        {/* Organization Filters */}
        <div className="space-y-4">
          <div className="pl-2">
            <h2 className="text-sm font-medium tracking-wide text-gray-500 uppercase">
              Organization Filters
            </h2>
          </div>

          <FilterSection
            title="Organization"
            icon={Building2}
            isOpen={openSections.moreFilters}
            onToggle={() => toggleSection('moreFilters')}
          >
            <FilterSearch
              value={filters.organization}
              onChange={(value) => setFilters({ ...filters, organization: value })}
              placeholder="Search organizations..."
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
        </div>
      </div>

      {/* Views Section - Fixed at Bottom */}
      <div className="p-5 border-t border-gray-100 bg-white/95 backdrop-blur-sm">
        <ViewsSection
          showAllEvents={showAllEvents}
          onToggle={onViewToggle}
          totalCount={totalCount}
          uniqueCount={uniqueCount}
        />
      </div>
    </div>
  );
}