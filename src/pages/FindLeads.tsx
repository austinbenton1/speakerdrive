import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '../components/Tooltip';
import { useLeadFilters } from '../hooks/useLeadFilters';
import { useLeadsData } from '../hooks/useLeadsData';
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
import { Search } from 'lucide-react';
import { locations, industries, timeframes, domainTypes } from '../constants/filters';

export default function FindLeads() {
  const navigate = useNavigate();
  const [showGuide, setShowGuide] = useState(true);
  const [opportunitiesFilter, setOpportunitiesFilter] = useState('');
  const { leads, loading, error } = useLeadsData();
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

  const filteredLeads = useLeadsFilter(leads, {
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
      {/* Left Sidebar Filters */}
      <div className="w-64 bg-white p-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6">
          <Search className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Find Leads</h2>
        </div>

        {/* Opportunities Filter */}
        <div className="mb-6">
          <OpportunitiesFilter
            value={opportunitiesFilter}
            onChange={setOpportunitiesFilter}
          />
        </div>

        {/* Lead Type Filter */}
        <LeadTypeFilter
          selectedLeadTypes={selectedLeadTypes}
          selectedEventUnlockTypes={selectedEventUnlockTypes}
          filters={filters}
          toggleLeadType={toggleLeadType}
          toggleEventUnlockType={toggleEventUnlockType}
          setFilters={setFilters}
        />

        {/* Industry Category */}
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

        {/* Domain Type */}
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

        {/* Location Filter */}
        <LocationFilter
          selectedLocations={filters.location}
          onLocationSelect={handleLocationSelect}
          isOpen={openSections.location}
          onToggle={() => toggleSection('location')}
        />

        {/* Date Added */}
        <FilterSection
          title="Date Added"
          isOpen={openSections.timeframe}
          onToggle={() => toggleSection('timeframe')}
        >
          <MultiSelect
            options={timeframes}
            selected={filters.timeframe}
            onChange={(value) => {
              const newTimeframes = filters.timeframe.includes(value)
                ? filters.timeframe.filter(t => t !== value)
                : [...filters.timeframe, value];
              setFilters(prev => ({ ...prev, timeframe: newTimeframes }));
            }}
          />
        </FilterSection>

        {/* Additional Filters */}
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

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Quick Start Guide */}
          {showGuide && (
            <QuickStartGuide onDismiss={() => setShowGuide(false)} />
          )}

          {/* Industry Quick Filters */}
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

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <LeadsTable 
                leads={filteredLeads} 
                onLeadClick={handleLeadClick}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}