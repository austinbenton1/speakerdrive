import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLeadFilters } from '../hooks/useLeadFilters';
import { useAvailableLeads } from '../hooks/useAvailableLeads';
import { useLeadsFilter } from '../hooks/useLeadsFilter';
import LeadsTable from '../components/leads/LeadsTable';
import SearchContainer from '../components/SearchContainer';
import LeftSidebarFilters from '../components/filters/LeftSidebarFilters';
import QuickLeadTypeFilter from '../components/filters/lead-type/QuickLeadTypeFilter';
import OpportunitiesFilter from '../components/filters/OpportunitiesFilter';
import { leadTypes, type LeadType } from '../components/filters/lead-type/leadTypeConfig';

export default function FindLeads() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [eventsFilter, setEventsFilter] = useState(() => searchParams.get('event') || '');
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
      setOpenSections(prev => ({
        ...prev,
        moreFilters: true
      }));
    }
  }, [searchParams, setFilters, setOpenSections]);

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
    unlockType: filters.unlockType,
    targetAudience: filters.targetAudience,
    jobTitle: filters.jobTitle
  });

  const handleLeadClick = (leadId: string) => {
    navigate(`/leads/${leadId}`);
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
      />

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <SearchContainer>
            <div className="space-y-6">
              <div className="max-w-xl">
                <OpportunitiesFilter
                  value={eventsFilter}
                  onChange={setEventsFilter}
                />
              </div>
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