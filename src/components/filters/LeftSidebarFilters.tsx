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
  isUSAOnly?: boolean;
  selectedLeadType: 'all' | 'contacts' | 'events';
  onLocationToggle?: () => void;
  setSelectedLeadType: (type: 'all' | 'contacts' | 'events', shouldUpdate: boolean) => void;
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
  uniqueCount = 0,
  isUSAOnly = false,
  selectedLeadType,
  onLocationToggle,
  setSelectedLeadType
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

  // Update region filter based on isUSAOnly prop
  useEffect(() => {
    if (isUSAOnly && filters.region !== 'United States') {
      setFilters({
        ...filters,
        region: 'United States'
      });
    } else if (!isUSAOnly && filters.region === 'United States') {
      setFilters({
        ...filters,
        region: ''
      });
    }
  }, [isUSAOnly, setFilters]);

  const handleRegionChange = (region: string) => {
    // If selecting a non-USA region, ensure worldwide view is enabled
    if (region && region !== 'United States' && region !== 'Virtual Only') {
      onLocationToggle?.();
    } else if (region === 'United States') {
      // If selecting USA, ensure USA-only view is enabled
      if (!isUSAOnly && onLocationToggle) {
        onLocationToggle();
      }
    }
    onRegionChange(region);
  };

  return (
    <div
      className={`
        bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden w-56
      `}
    >
      {/* Main Scrollable Content */}
      <div className={`
        flex-1 overflow-y-auto
      `}>
        <div className="p-2 pt-2">
          {/* Section Headers */}
          <div className="mb-1">
            <h2 className={`
              px-1.5 mb-3 text-[13px] font-semibold text-gray-700 uppercase tracking-wide
            `}>
              Unlock Types
            </h2>
            <div>
              <UnlockTypeFilter
                selectedTypes={filters.unlockType || []}
                onTypeSelect={(type) => {
                  const currentTypes = filters.unlockType || [];
                  let newTypes: string[] = [];

                  // If clicking Contact Emails
                  if (type === 'Unlock Contact Email') {
                    if (currentTypes.includes(type)) {
                      // If deselecting Contact Email, just remove it
                      newTypes = currentTypes.filter(t => t !== type);
                      // Reset to 'all' lead type when no unlock types selected
                      setSelectedLeadType('all', false);
                    } else {
                      // If selecting Contact Email, remove Event types and add Contact
                      newTypes = [type];
                      // Switch to 'contacts' lead type
                      setSelectedLeadType('contacts', false);
                    }
                  } 
                  // If clicking Event buttons
                  else if (type === 'Unlock Event Email' || type === 'Unlock Event URL') {
                    // Remove Contact Email if present
                    const withoutContact = currentTypes.filter(t => t !== 'Unlock Contact Email');
                    
                    if (currentTypes.includes(type)) {
                      // If deselecting an Event type, just remove it
                      newTypes = withoutContact.filter(t => t !== type);
                      // If no event types left, reset to 'all' lead type
                      if (newTypes.length === 0) {
                        setSelectedLeadType('all', false);
                      }
                    } else {
                      // If selecting an Event type, add it to other Event types (if any)
                      newTypes = [...withoutContact, type];
                      // Switch to 'events' lead type
                      setSelectedLeadType('events', false);
                    }
                  }

                  setFilters({ ...filters, unlockType: newTypes });
                }}
                isOpen={openSections.unlockType}
                onToggle={() => setOpenSections({ ...openSections, unlockType: !openSections.unlockType })}
              />
            </div>
          </div>

          {/* Event Filters */}
          <div className="mb-1">
            <h2 className={`
              px-1.5 mb-3 text-[13px] font-semibold text-gray-700 uppercase tracking-wide
              ${isCollapsed ? 'sr-only' : ''}
            `}>
              Event Filters
            </h2>

            <div className="space-y-1">
              <FilterSection
                title="Event Format"
                icon={Calendar}
                isOpen={openSections.eventFormat}
                onToggle={() => setOpenSections({ ...openSections, eventFormat: !openSections.eventFormat })}
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
                onToggle={() => setOpenSections({ ...openSections, industry: !openSections.industry })}
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
                onToggle={() => setOpenSections({ ...openSections, pastSpeakers: !openSections.pastSpeakers })}
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
          <div className="mb-1">
            <h2 className="px-1.5 mb-3 text-[13px] font-semibold text-gray-700 uppercase tracking-wide">
              Event Location
            </h2>

            <div className="space-y-1.5">
              <LocationFilter
                region={filters.region || ''}
                state={filters.state || []}
                city={filters.city || []}
                onRegionChange={(region) => setFilters({ ...filters, region })}
                onStateChange={(state) => setFilters({ ...filters, state })}
                onCityChange={(city) => setFilters({ ...filters, city })}
                isOpen={openSections.location}
                onToggle={() => setOpenSections({ ...openSections, location: !openSections.location })}
                isUSAOnly={isUSAOnly}
              />
            </div>
          </div>

          {/* Organization Filters */}
          <div className="mb-1">
            <h2 className="px-1.5 mb-3 text-[13px] font-semibold text-gray-700 uppercase tracking-wide">
              Organization Filters
            </h2>

            <div className="space-y-1.5">
              <FilterSection
                title="Organization"
                icon={Building2}
                isOpen={openSections.moreFilters}
                onToggle={() => setOpenSections({ ...openSections, moreFilters: !openSections.moreFilters })}
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
                onToggle={() => setOpenSections({ ...openSections, organizationType: !openSections.organizationType })}
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
        pb-4 border-t border-gray-100 bg-white/95 backdrop-blur-sm
      `}>
        <ViewsSection
          showAllEvents={showAllEvents}
          onToggle={onViewToggle}
          totalCount={totalCount}
          uniqueCount={uniqueCount}
          selectedLeadType={selectedLeadType}
        />
      </div>
    </div>
  );
}