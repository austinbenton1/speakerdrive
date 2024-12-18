import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useLeadFilters } from '../hooks/useLeadFilters';
import { useAvailableLeads } from '../hooks/useAvailableLeads';
import { useLeadsFilter } from '../hooks/useLeadsFilter';
import LeadTypeFilter from '../components/leads/LeadTypeFilter';
import LeadsTable from '../components/leads/LeadsTable';
import FilterSection from '../components/filters/FilterSection';
import FilterSearch from '../components/filters/FilterSearch';
import MultiSelect from '../components/filters/MultiSelect';
import SearchContainer from '../components/SearchContainer';
import OpportunitiesFilter from '../components/filters/OpportunitiesFilter';
import IndustryQuickFilters from '../components/filters/IndustryQuickFilters';
import LocationFilter from '../components/filters/LocationFilter';
import EventFormatFilter from '../components/filters/EventFormatFilter';
import OrganizationTypeFilter from '../components/filters/OrganizationTypeFilter';
import QuickStartGuide from '../components/QuickStartGuide';
import { industries, eventFormats, organizationTypes } from '../constants/filters';

export default function FindLeads() {
  const navigate = useNavigate();
  const [showGuide, setShowGuide] = React.useState(true);
  const [opportunitiesFilter, setOpportunitiesFilter] = React.useState('');
  const { leads: availableLeads, loading, error } = useAvailableLeads();
  
  const {
    selectedLeadTypes,
    selectedEventUnlockTypes,
    filters,
    openSections,
    setFilters,
    toggleLeadType,
    toggleEventUnlockType,
    toggleSection,
  } = useLeadFilters();

  const filteredLeads = useLeadsFilter(availableLeads, {
    opportunitiesFilter,
    selectedLeadTypes: selectedLeadTypes.map(type => type === 'Events' ? 'Event' : 'Contact'),
    jobTitle: selectedLeadTypes.length === 1 && selectedLeadTypes[0] === 'Contacts' ? filters.jobTitle : undefined,
    targetAudience: selectedLeadTypes.length === 1 && selectedLeadTypes[0] === 'Events' ? filters.targetAudience : undefined,
    selectedEventUnlockTypes: selectedLeadTypes.length === 1 && selectedLeadTypes[0] === 'Events' ? selectedEventUnlockTypes : undefined,
    selectedIndustries: filters.industry,
    selectedLocations: filters.location,
    selectedEventFormats: filters.eventFormat || [],
    selectedOrgTypes: filters.organizationType || [],
    organization: filters.organization,
    pastSpeakers: filters.pastSpeakers,
    searchAll: filters.searchAll
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const handleLeadClick = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  const handleUnselectAllIndustries = () => {
    setFilters(prev => ({ ...prev, industry: [] }));
  };

  const handleLocationSelect = (location: string) => {
    setFilters(prev => ({
      ...prev,
      location: prev.location.includes(location)
        ? prev.location.filter(l => l !== location)
        : [...prev.location, location]
    }));
  };

  const handleEventFormatSelect = (format: string) => {
    setFilters(prev => ({
      ...prev,
      eventFormat: prev.eventFormat.includes(format)
        ? prev.eventFormat.filter(f => f !== format)
        : [...prev.eventFormat, format],
    }));
  };

  const handleOrgTypeSelect = (orgType: string) => {
    setFilters(prev => ({
      ...prev,
      organizationType: prev.organizationType.includes(orgType)
        ? prev.organizationType.filter(t => t !== orgType)
        : [...prev.organizationType, orgType],
    }));
  };

  return (
    <div className="flex h-full bg-gray-50">
      <div className="w-64 bg-white p-4 overflow-y-auto">
        {/* 1. Opportunities filter */}
        <OpportunitiesFilter
          value={opportunitiesFilter}
          onChange={setOpportunitiesFilter}
        />

        {/* 2. Lead Type filter & sub-filters */}
        <LeadTypeFilter
          selectedLeadTypes={selectedLeadTypes}
          selectedEventUnlockTypes={selectedEventUnlockTypes}
          filters={filters}
          setFilters={setFilters}
          toggleLeadType={toggleLeadType}
          toggleEventUnlockType={toggleEventUnlockType}
        />

        {/* 3. Event Format filter */}
        <EventFormatFilter
          selectedFormats={filters.eventFormat}
          onFormatSelect={handleEventFormatSelect}
          isOpen={openSections.eventFormat}
          onToggle={() => toggleSection('eventFormat')}
          onUnselectAll={() => setFilters(prev => ({ ...prev, eventFormat: [] }))}
        />

        {/* 4. Industry Category filter */}
        <FilterSection
          title="Industry Category"
          isOpen={openSections.industry}
          onToggle={() => toggleSection('industry')}
          onUnselectAll={handleUnselectAllIndustries}
          showUnselectAll={filters.industry.length > 0}
        >
          <MultiSelect
            options={industries}
            selected={filters.industry}
            onChange={(value) => {
              const newIndustries = filters.industry.includes(value)
                ? filters.industry.filter(i => i !== value)
                : [...filters.industry, value];
              setFilters(prev => ({ ...prev, industry: newIndustries }));
            }}
          />
        </FilterSection>

        {/* 5. Organization Type filter */}
        <OrganizationTypeFilter
          selectedOrgTypes={filters.organizationType}
          onOrgTypeSelect={handleOrgTypeSelect}
          isOpen={openSections.organizationType}
          onToggle={() => toggleSection('organizationType')}
          onUnselectAll={() => setFilters(prev => ({ ...prev, organizationType: [] }))}
        />

        {/* 6. Location filter */}
        <LocationFilter
          selectedLocations={filters.location}
          onLocationSelect={handleLocationSelect}
          isOpen={openSections.location}
          onToggle={() => toggleSection('location')}
        />

        {/* 7. Additional filter & sub-filters */}
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

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {showGuide && (
            <QuickStartGuide onDismiss={() => setShowGuide(false)} />
          )}

          <SearchContainer>
            <div className="space-y-4">
              <h3 className="text-[14px] font-medium text-gray-700">Industry Category</h3>
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
            </div>
          </SearchContainer>

          <div className="bg-white border border-gray-200 rounded-lg mt-6">
            <LeadsTable 
              leads={filteredLeads}
              onLeadClick={handleLeadClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}