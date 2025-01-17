import React, { useState, useEffect } from 'react';
import { Users, Calendar, Building2, Search, X, ChevronLeft, Filter, MapPin, Lock } from 'lucide-react';
import FilterSection from './FilterSection';
import FilterSearch from './FilterSearch';
import UnlockTypeFilter from './UnlockTypeFilter';
import MultiSelect from './MultiSelect';
import ViewsSection from './ViewsSection';
import LocationFilter from './LocationFilter';
import { eventFormats, industries, organizationTypes } from '../../constants/filters';
import type { FilterOptions, OpenSections } from '../../types';

interface LeftSidebarFiltersProps {
  filters: FilterOptions;
  openSections: OpenSections;
  setFilters: (filters: FilterOptions) => void;
  setOpenSections: (sections: OpenSections) => void;
  toggleSection: (section: string) => void;
  handleUnlockTypeChange: (type: string | undefined) => void;
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
  handleUnlockTypeChange,
  selectedUnlockType,
  showAllEvents = true,
  onViewToggle,
  totalCount = 0,
  uniqueCount = 0
}: LeftSidebarFiltersProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [speakerInput, setSpeakerInput] = useState('');
  const [organizationInput, setOrganizationInput] = useState('');

  // Expand sidebar on hover when collapsed
  useEffect(() => {
    if (isHovered && isCollapsed) {
      const timer = setTimeout(() => {
        setIsCollapsed(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isHovered, isCollapsed]);

  // Reset all input states when filters are cleared
  useEffect(() => {
    if (!filters.pastSpeakers) setSpeakerInput('');
    if (!filters.organization.length) setOrganizationInput('');
  }, [filters]);

  const handleSpeakerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && speakerInput.trim()) {
      e.preventDefault();
      const newSpeaker = speakerInput.trim();
      if (!filters.pastSpeakers.includes(newSpeaker)) {
        setFilters({
          ...filters,
          pastSpeakers: [...filters.pastSpeakers, newSpeaker]
        });
      }
      setSpeakerInput('');
    }
  };

  const handleOrganizationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && organizationInput.trim()) {
      e.preventDefault();
      const newOrg = organizationInput.trim();
      if (!filters.organization.includes(newOrg)) {
        setFilters({
          ...filters,
          organization: [...filters.organization, newOrg]
        });
      }
      setOrganizationInput('');
    }
  };

  const removeSpeaker = (speaker: string) => {
    setFilters({
      ...filters,
      pastSpeakers: filters.pastSpeakers.filter(s => s !== speaker)
    });
  };

  const removeOrganization = (org: string) => {
    setFilters({
      ...filters,
      organization: filters.organization.filter(o => o !== org)
    });
  };

  return (
    <div
      className={`
        bg-white border-r border-gray-200 flex flex-col h-full
        transition-all duration-300 ease-in-out relative
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`
          absolute top-4 -right-3 w-6 h-12 bg-white border border-gray-200 
          rounded-lg shadow-md z-10 flex items-center justify-center
          hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500
          transition-all duration-300 group
          ${isCollapsed ? 'rotate-180' : ''}
        `}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Main Scrollable Content */}
      <div className={`
        flex-1 overflow-y-auto
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'invisible w-0' : 'visible w-full'}
      `}>
        <div className="p-3 pt-6">
          {/* Section Headers */}
          <div className={`mb-8 ${isCollapsed ? 'px-2' : ''}`}>
            <h2 className={`
              px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide
              ${isCollapsed ? 'sr-only' : ''}
            `}>
              Unlock Types
            </h2>
            <div className={isCollapsed ? 'space-y-4' : ''}>
              <UnlockTypeFilter
                selectedTypes={filters.unlockType ? [filters.unlockType] : []}
                onTypeSelect={handleUnlockTypeChange}
                isOpen={!isCollapsed && openSections.unlockType}
                onToggle={() => toggleSection('unlockType')}
                isCollapsed={isCollapsed}
              />
            </div>
          </div>

          {/* Event Filters */}
          <div className={`mb-8 ${isCollapsed ? 'px-2' : ''}`}>
            <h2 className={`
              px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide
              ${isCollapsed ? 'sr-only' : ''}
            `}>
              Event Filters
            </h2>

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
                title="Event Category"
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
                title="Event Speakers"
                icon={Search}
                isOpen={openSections.pastSpeakers}
                onToggle={() => toggleSection('pastSpeakers')}
              >
                <div className="space-y-2">
                  {filters.pastSpeakers.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
                      {filters.pastSpeakers.map((speaker) => (
                        <span
                          key={speaker}
                          className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-white border border-gray-200 text-gray-700"
                        >
                          {speaker}
                          <button
                            onClick={() => removeSpeaker(speaker)}
                            className="ml-1 p-0.5 hover:text-red-500 rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <FilterSearch
                    value={speakerInput}
                    onChange={setSpeakerInput}
                    onKeyDown={handleSpeakerKeyDown}
                    placeholder="Enter speaker name"
                    helperText="Search events based on past speakers and experts. Press Enter to add each speaker."
                  />
                </div>
              </FilterSection>
            </div>
          </div>

          {/* Event Location */}
          <div className="mb-8">
            <h2 className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Event Location
            </h2>

            <div className="space-y-1">
              <LocationFilter
                region={filters.region || ''}
                state={filters.state || []}
                city={filters.city || []}
                onRegionChange={(region) => setFilters({ ...filters, region })}
                onStateChange={(state) => setFilters({ ...filters, state })}
                onCityChange={(city) => setFilters({ ...filters, city })}
                isOpen={openSections.location}
                onToggle={() => toggleSection('location')}
              />
            </div>
          </div>

          {/* Organization Filters */}
          <div className="mb-8">
            <h2 className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Organization Filters
            </h2>

            <div className="space-y-1">
              <FilterSection
                title="Organization"
                icon={Building2}
                isOpen={openSections.moreFilters}
                onToggle={() => toggleSection('moreFilters')}
              >
                <div className="space-y-2">
                  {filters.organization.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
                      {filters.organization.map((org) => (
                        <span
                          key={org}
                          className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-white border border-gray-200 text-gray-700"
                        >
                          {org}
                          <button
                            onClick={() => removeOrganization(org)}
                            className="ml-1 p-0.5 hover:text-red-500 rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <FilterSearch
                    value={organizationInput}
                    onChange={setOrganizationInput}
                    onKeyDown={handleOrganizationKeyDown}
                    placeholder="e.g. Microsoft"
                    helperText="Press Enter to add each organization"
                  />
                </div>
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
        </div>
      </div>

      {/* Views Section */}
      <div className={`
        p-4 border-t border-gray-100 bg-white/95 backdrop-blur-sm
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'invisible w-0' : 'visible w-full'}
      `}>
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