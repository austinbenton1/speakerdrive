import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLeadFilters } from '../hooks/useLeadFilters';
import { useAvailableLeads } from '../hooks/useAvailableLeads';
import { useLeadsFilter } from '../hooks/useLeadsFilter';
import { getUniqueLeads } from '../utils/deduplication';
import LeadsTable from '../components/leads/LeadsTable';
import LeftSidebarFilters from '../components/filters/LeftSidebarFilters';
import QuickLeadTypeFilter from '../components/filters/lead-type/QuickLeadTypeFilter';
import OpportunitiesFilter from '../components/filters/OpportunitiesFilter';
import { leadTypes, type LeadType } from '../components/filters/lead-type/leadTypeConfig';
import type { Lead } from '../types';

export default function FindLeads() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [eventsFilter, setEventsFilter] = useState(() => {
    const urlEvent = searchParams.get('event');
    return urlEvent && urlEvent.trim() ? urlEvent : '';
  });
  const [selectedLeadType, setSelectedLeadType] = useState<string>('all');
  const [showAllEvents, setShowAllEvents] = useState(true);
  const { leads: availableLeads, loading, error } = useAvailableLeads();
  const [displayedLeads, setDisplayedLeads] = useState<Lead[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  
  const {
    filters,
    openSections,
    setFilters,
    setOpenSections,
    toggleSection,
  } = useLeadFilters();

  // Initialize filters and handle URL parameters once on mount
  useEffect(() => {
    const orgParam = searchParams.get('organization');
    
    setFilters(prev => ({
      ...prev,
      industry: [],
      eventFormat: [],
      organization: orgParam ? [orgParam] : [],
      organizationType: [],
      pastSpeakers: '',
      searchAll: '',
      unlockType: undefined,
      jobTitle: '',
      region: '',
      state: [],
      city: []
    }));

    if (orgParam) {
      setIsFiltering(true);
    }
  }, []); // Empty dependency array for initialization

  // Memoize active filters check
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      eventsFilter ||
      filters.industry?.length ||
      filters.eventFormat?.length ||
      filters.organization?.length ||
      filters.organizationType?.length ||
      filters.pastSpeakers ||
      filters.searchAll ||
      filters.jobTitle ||
      filters.region ||
      filters.state?.length ||
      filters.city?.length ||
      selectedLeadType !== 'all' ||
      !showAllEvents
    );
  }, [
    eventsFilter,
    filters,
    selectedLeadType,
    showAllEvents
  ]);

  // Memoize filtered results
  const filteredResults = useLeadsFilter(availableLeads, {
    opportunitiesFilter: eventsFilter,
    selectedLeadTypes: ['Event', 'Contact'],
    selectedIndustries: filters.industry,
    selectedEventFormats: filters.eventFormat || [],
    organization: filters.organization,
    organizationType: filters.organizationType || [],
    pastSpeakers: filters.pastSpeakers,
    searchAll: filters.searchAll,
    unlockType: filters.unlockType,
    targetAudience: filters.targetAudience || [],
    jobTitle: filters.jobTitle,
    region: filters.region,
    state: filters.state || [],
    city: filters.city || []
  });

  // Update displayed leads when necessary
  useEffect(() => {
    const results = hasActiveFilters
      ? filteredResults
      : availableLeads.slice(0, 50);

    const finalResults = showAllEvents ? results : getUniqueLeads(results);
    
    if (JSON.stringify(displayedLeads) !== JSON.stringify(finalResults)) {
      setDisplayedLeads(finalResults);
      setIsFiltering(hasActiveFilters);
    }
  }, [filteredResults, hasActiveFilters, showAllEvents, availableLeads]);

  // Memoize unique count calculation
  const uniqueLeadsCount = useMemo(() => 
    getUniqueLeads(displayedLeads).length,
  [displayedLeads]);

  const handleResetFilters = () => {
    setFilters({
      industry: [],
      eventFormat: [],
      organization: [],
      organizationType: [],
      pastSpeakers: '',
      searchAll: '',
      unlockType: undefined,
      jobTitle: '',
      region: '',
      state: [],
      city: []
    });
    setEventsFilter('');
    setSelectedLeadType('all');
    setShowAllEvents(true);
  };

  const handleCompleteReset = () => {
    handleResetFilters();
    setIsFiltering(false);
    setOpenSections({
      targetAudience: false,
      eventFormat: false,
      industry: false,
      organization: false,
      organizationType: false,
      location: false
    });
  };

  const handleLeadClick = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  const handleLeadTypeChange = (type: LeadType) => {
    setSelectedLeadType(type);
    const selectedType = leadTypes.find(t => t.id === type);
    
    setFilters(prev => ({
      ...prev,
      unlockType: selectedType?.unlockValue,
      jobTitle: selectedType?.unlockValue === 'Unlock Contact Email' ? prev.jobTitle : ''
    }));
  };

  return (
    <div className="flex h-full bg-gray-50">
      <LeftSidebarFilters
        filters={filters}
        openSections={openSections}
        setFilters={setFilters}
        setOpenSections={setOpenSections}
        toggleSection={toggleSection}
        selectedUnlockType={filters.unlockType}
        showAllEvents={showAllEvents}
        onViewToggle={() => setShowAllEvents(!showAllEvents)}
        totalCount={displayedLeads.length}
        uniqueCount={uniqueLeadsCount}
      />

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            {error ? (
              <div className="text-red-600 mb-4">
                Error loading leads. Please try refreshing the page.
              </div>
            ) : null}
            <div className="space-y-6">
              <div className="w-[700px]">
                <OpportunitiesFilter
                  value={eventsFilter}
                  onChange={setEventsFilter}
                  onReset={handleCompleteReset}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
              <div className="max-w-[650px]">
                <QuickLeadTypeFilter
                  selectedType={selectedLeadType}
                  onTypeChange={handleLeadTypeChange}
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg mt-6">
            <LeadsTable 
              leads={displayedLeads}
              loading={loading}
              onLeadClick={handleLeadClick}
              onResetFilters={handleResetFilters}
            />
          </div>
        </div>
      </div>
    </div>
  );
}