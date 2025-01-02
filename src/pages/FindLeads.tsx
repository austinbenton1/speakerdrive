import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLeadFilters } from '../hooks/useLeadFilters';
import { useAvailableLeads } from '../hooks/useAvailableLeads';
import { useLeadsFilter } from '../hooks/useLeadsFilter';
import LeadsTable from '../components/leads/LeadsTable';
import SearchContainer from '../components/SearchContainer';
import QuickStartGuide from '../components/QuickStartGuide';
import LeftSidebarFilters from '../components/filters/LeftSidebarFilters';
import QuickLeadTypeFilter from '../components/filters/lead-type/QuickLeadTypeFilter';
import { leadTypes, type LeadType } from '../components/filters/lead-type/leadTypeConfig';

export default function FindLeads() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showGuide, setShowGuide] = useState(true);
  const [eventsFilter, setEventsFilter] = useState(() => {
    // Initialize with URL parameter if it exists
    return searchParams.get('event') || '';
  });
  const [selectedLeadType, setSelectedLeadType] = useState<LeadType>('all');
  const { leads: availableLeads, loading, error } = useAvailableLeads();
  
  const {
    filters,
    openSections,
    setFilters,
    setOpenSections,
    toggleSection,
  } = useLeadFilters();

  // Initialize filters with URL parameters
  useEffect(() => {
    const organization = searchParams.get('organization');
    if (organization) {
      setFilters(prev => ({
        ...prev,
        organization
      }));
      // Open the Additional Filters section (correct section name is 'moreFilters')
      setOpenSections(prev => ({
        ...prev,
        moreFilters: true
      }));
    }
  }, [searchParams, setFilters, setOpenSections]);

  const handleLeadTypeChange = (type: LeadType) => {
    setSelectedLeadType(type);
    // Find the selected lead type configuration
    const selectedType = leadTypes.find(t => t.id === type);
    if (selectedType?.unlockValue) {
      // Update filters based on unlock value
      setFilters(prev => ({
        ...prev,
        unlockType: selectedType.unlockValue
      }));
    } else {
      // Clear unlock type filter for 'all' type
      setFilters(prev => ({
        ...prev,
        unlockType: undefined
      }));
    }
  };

  const filteredLeads = useLeadsFilter(availableLeads, {
    opportunitiesFilter: eventsFilter,
    selectedLeadTypes: ['Event', 'Contact'],
    selectedIndustries: filters.industry,
    selectedLocations: filters.location,
    selectedEventFormats: filters.eventFormat || [],
    selectedOrgTypes: filters.organizationType || [],
    organization: filters.organization,
    pastSpeakers: filters.pastSpeakers,
    searchAll: filters.searchAll,
    unlockType: filters.unlockType
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

  return (
    <div className="flex h-full bg-gray-50">
      <LeftSidebarFilters
        filters={filters}
        openSections={openSections}
        eventsFilter={eventsFilter}
        onEventsFilterChange={setEventsFilter}
        setFilters={setFilters}
        setOpenSections={setOpenSections}
        toggleSection={toggleSection}
      />

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {showGuide && (
            <QuickStartGuide onDismiss={() => setShowGuide(false)} />
          )}

          <SearchContainer>
            <div className="space-y-6">
              <QuickLeadTypeFilter
                selectedType={selectedLeadType}
                onTypeChange={handleLeadTypeChange}
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