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

export default function FindLeads() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [eventsFilter, setEventsFilter] = useState(() => {
    const urlEvent = searchParams.get('event');
    // Only set eventsFilter if the URL param exists and is not empty
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

  useEffect(() => {
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
  }, []); // Run only once on mount

  const hasActiveFilters = useMemo(() => {
    // Check for any non-empty arrays or truthy values in filters
    const activeFilterValues = [
      eventsFilter,                    // Search text
      filters.industry?.length,        // Selected industries
      filters.eventFormat?.length,     // Selected event formats
      filters.organization?.length,    // Selected organizations
      filters.organizationType?.length,// Selected org types
      filters.pastSpeakers,           // Past speakers text
      filters.searchAll,              // Search all text
      filters.jobTitle,               // Job title text
      filters.region,                 // Region text
      filters.state?.length,          // Selected states
      filters.city?.length,           // Selected cities
      selectedLeadType !== 'all',      // Lead type selection
      !showAllEvents,                  // Consider unique view as an active filter
    ];

    // Return true if any filter is active
    return activeFilterValues.some(value => Boolean(value));
  }, [
    eventsFilter,
    filters.industry,
    filters.eventFormat,
    filters.organization,
    filters.organizationType,
    filters.pastSpeakers,
    filters.searchAll,
    filters.jobTitle,
    filters.region,
    filters.state,
    filters.city,
    selectedLeadType,
    showAllEvents,
  ]);

  const handleResetFilters = () => {
    // Reset all filter values
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
    // Reset Event Display to default state (showing all events)
    setShowAllEvents(true);
  };

  const handleCompleteReset = () => {
    // Reset all filter values
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

    // Reset opportunities filter
    setEventsFilter('');
    setSelectedLeadType('all');
    // Reset Event Display to default state
    setShowAllEvents(true);
    setIsFiltering(false);

    // Collapse all filter sections
    setOpenSections({
      targetAudience: false,
      eventFormat: false,
      industry: false,
      organization: false,
      organizationType: false,
      location: false
    });
  };

  // Set initial 50 records when leads are loaded
  useEffect(() => {
    if (availableLeads.length > 0 && !isFiltering) {
      setDisplayedLeads(availableLeads.slice(0, 50));
    }
  }, [availableLeads, isFiltering]);

  // Handle URL parameters on mount
  useEffect(() => {
    const orgParam = searchParams.get('organization');
    if (orgParam) {
      setFilters(prev => ({
        ...prev,
        organization: [orgParam]
      }));
      setIsFiltering(true);
    }
  }, [searchParams]);

  // Get filtered results using the hook
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

  // Update displayed leads when filters change
  useEffect(() => {
    setIsFiltering(hasActiveFilters);

    if (hasActiveFilters) {
      // Apply unique filter only when showAllEvents is false
      const results = showAllEvents ? filteredResults : getUniqueLeads(filteredResults);
      setDisplayedLeads(results);
    } else {
      // If no filters active, still respect the showAllEvents toggle
      const results = showAllEvents ? availableLeads : getUniqueLeads(availableLeads);
      setDisplayedLeads(results.slice(0, 50));
    }
  }, [filters, eventsFilter, showAllEvents, filteredResults, hasActiveFilters, availableLeads]);

  // Calculate unique count for display
  const uniqueLeadsCount = useMemo(() => {
    return getUniqueLeads(displayedLeads).length;
  }, [displayedLeads]);

  const handleLeadClick = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  const handleLeadTypeChange = (type: LeadType) => {
    setSelectedLeadType(type);
    const selectedType = leadTypes.find(t => t.id === type);
    if (selectedType?.unlockValue) {
      setFilters(prev => ({
        ...prev,
        unlockType: selectedType.unlockValue,
        jobTitle: selectedType.unlockValue === 'Unlock Contact Email' ? prev.jobTitle : ''
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        unlockType: undefined,
        jobTitle: ''
      }));
    }
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