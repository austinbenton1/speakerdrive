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
import QuickStartGuide from '../components/QuickStartGuide';
import { industries, domainTypes } from '../constants/filters';

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
    selectedDomains: filters.domain,
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

  const handleUnselectAllDomains = () => {
    setFilters(prev => ({ ...prev, domain: [] }));
  };

  const handleLocationSelect = (location: string) => {
    setFilters(prev => ({
      ...prev,
      location: prev.location.includes(location)
        ? prev.location.filter(l => l !== location)
        : [...prev.location, location]
    }));
  };

  return (
    <div className="flex h-full bg-gray-50">
      <div className="w-64 bg-white p-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6">
          <Search className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Find Leads</h2>
        </div>

        <OpportunitiesFilter
          value={opportunitiesFilter}
          onChange={setOpportunitiesFilter}
        />

        <LeadTypeFilter
          selectedLeadTypes={selectedLeadTypes}
          selectedEventUnlockTypes={selectedEventUnlockTypes}
          filters={filters}
          toggleLeadType={toggleLeadType}
          toggleEventUnlockType={toggleEventUnlockType}
          setFilters={setFilters}
        />

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

        <FilterSection
          title="Domain Type"
          isOpen={openSections.domain}
          onToggle={() => toggleSection('domain')}
          onUnselectAll={handleUnselectAllDomains}
          showUnselectAll={filters.domain.length > 0}
        >
          <MultiSelect
            options={domainTypes}
            selected={filters.domain}
            onChange={(value) => {
              const newDomains = filters.domain.includes(value)
                ? filters.domain.filter(d => d !== value)
                : [...filters.domain, value];
              setFilters(prev => ({ ...prev, domain: newDomains }));
            }}
          />
        </FilterSection>

        <LocationFilter
          selectedLocations={filters.location}
          onLocationSelect={handleLocationSelect}
          isOpen={openSections.location}
          onToggle={() => toggleSection('location')}
        />

        <FilterSection
          title="Additional Filters"
          isOpen={openSections.moreFilters}
          onToggle={() => toggleSection('moreFilters')}
        >
          <div className="space-y-4">
            <FilterSearch
              label="Organization"
              value={filters.organization}
              onChange={(value) => setFilters(prev => ({ ...prev, organization: value }))}
              placeholder="Search organization..."
            />
            <FilterSearch
              label="Past Speakers & Experts"
              value={filters.pastSpeakers}
              onChange={(value) => setFilters(prev => ({ ...prev, pastSpeakers: value }))}
              placeholder="Search past speakers & experts..."
            />
            <FilterSearch
              label="Search SpeakerDrive (All)"
              value={filters.searchAll}
              onChange={(value) => setFilters(prev => ({ ...prev, searchAll: value }))}
              placeholder="Search SpeakerDrive (All)..."
            />
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