import React, { useState, useEffect } from 'react';
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
  const [eventsFilter, setEventsFilter] = useState(() => searchParams.get('event') || '');
  const [selectedLeadType, setSelectedLeadType] = useState<LeadType>('all');
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

  const handleResetFilters = () => {
    setFilters({
      industry: [],
      eventFormat: [],
      organization: [],
      organizationType: [],
      pastSpeakers: '',
      searchAll: '',
      unlockType: undefined,
      targetAudience: [],
      jobTitle: '',
      region: '',
      state: [],
      city: []
    });
    setEventsFilter('');
    setSelectedLeadType('all');
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
    const hasActiveFilters = 
      eventsFilter ||
      filters.industry?.length > 0 ||
      filters.eventFormat?.length > 0 ||
      filters.organization?.length > 0 ||
      filters.organizationType?.length > 0 ||
      filters.pastSpeakers ||
      filters.searchAll ||
      filters.unlockType ||
      filters.targetAudience?.length > 0 ||
      filters.jobTitle ||
      filters.region ||
      filters.state?.length > 0 ||
      filters.city?.length > 0;

    setIsFiltering(hasActiveFilters);

    if (hasActiveFilters) {
      const finalResults = showAllEvents ? filteredResults : getUniqueLeads(filteredResults);
      setDisplayedLeads(finalResults);
    }
  }, [filters, eventsFilter, showAllEvents, filteredResults]);

  const uniqueLeadsCount = getUniqueLeads(displayedLeads).length;

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
            ) : !loading && !isFiltering && (
              <div className="mb-4 text-sm text-gray-600">
                Showing first 50 records. Use filters to see more specific results.
              </div>
            )}
            <div className="space-y-6">
              <div className="max-w-xl">
                <OpportunitiesFilter
                  value={eventsFilter}
                  onChange={setEventsFilter}
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