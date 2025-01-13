import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLeadFilters } from '../hooks/useLeadFilters';
import { useAvailableLeads } from '../hooks/useAvailableLeads';
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
  const [showAllEvents, setShowAllEvents] = useState(() => {
    const displayParam = searchParams.get('event_display');
    return displayParam === 'all';
  });
  const [opportunityTags, setOpportunityTags] = useState<string[]>([]);
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
      opportunityTags.length > 0
    );
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
    opportunityTags
  ]);

  // Apply filters to leads
  const filteredLeads = useMemo(() => {
    let results = [...availableLeads];

    // Filter by opportunities search term
    if (eventsFilter || opportunityTags.length > 0) {
      results = results.filter(lead => {
        const searchFields = [
          lead.event_name,
          lead.focus,
          lead.keywords
        ];
        
        if (eventsFilter) {
          const searchTerm = eventsFilter.toLowerCase();
          if (searchFields.some(field => field?.toLowerCase().includes(searchTerm))) {
            return true;
          }
        }
        
        if (opportunityTags.length > 0) {
          return opportunityTags.some(tag => 
            searchFields.some(field => field?.toLowerCase().includes(tag.toLowerCase()))
          );
        }
        
        return false;
      });
    }

    // Filter by industry
    if (filters.industry?.length) {
      results = results.filter(lead => 
        filters.industry.some(industry => 
          lead.industry?.toLowerCase().includes(industry.toLowerCase())
        )
      );
    }

    // Filter by event format
    if (filters.eventFormat?.length) {
      results = results.filter(lead => 
        filters.eventFormat.some(format => 
          lead.event_format?.toLowerCase().includes(format.toLowerCase())
        )
      );
    }

    // Filter by organization
    if (filters.organization?.length) {
      results = results.filter(lead => 
        filters.organization.some(org => 
          lead.organization?.toLowerCase().includes(org.toLowerCase())
        )
      );
    }

    // Filter by organization type
    if (filters.organizationType?.length) {
      results = results.filter(lead => 
        filters.organizationType.includes(lead.organization_type || '')
      );
    }

    // Filter by job title
    if (filters.jobTitle) {
      results = results.filter(lead => 
        lead.job_title?.toLowerCase().includes(filters.jobTitle.toLowerCase())
      );
    }

    // Filter by region
    if (filters.region) {
      results = results.filter(lead => 
        lead.region?.toLowerCase() === filters.region.toLowerCase()
      );
    }

    // Filter by state
    if (filters.state?.length) {
      results = results.filter(lead => 
        filters.state.some(state => 
          lead.state?.toLowerCase() === state.toLowerCase()
        )
      );
    }

    // Filter by city
    if (filters.city?.length) {
      results = results.filter(lead => 
        filters.city.some(city => 
          lead.city?.toLowerCase().includes(city.toLowerCase())
        )
      );
    }

    // Filter by unlock type
    if (filters.unlockType) {
      results = results.filter(lead => 
        lead.unlock_type === filters.unlockType
      );
    }

    return results;
  }, [availableLeads, eventsFilter, filters, opportunityTags]);

  // Update displayed leads when necessary
  useEffect(() => {
    const results = hasActiveFilters ? filteredLeads : availableLeads;
    const finalResults = showAllEvents ? results : getUniqueLeads(results);
    setDisplayedLeads(finalResults);
    setIsFiltering(hasActiveFilters);
  }, [filteredLeads, hasActiveFilters, showAllEvents, availableLeads]);

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
    setOpportunityTags([]);
    setSelectedLeadType('all');
    setShowAllEvents(false);
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
                  tags={opportunityTags}
                  onAddTag={(tag) => setOpportunityTags([...opportunityTags, tag])}
                  onRemoveTag={(tag) => setOpportunityTags(opportunityTags.filter(t => t !== tag))}
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
              showAllEvents={showAllEvents}
              uniqueCount={uniqueLeadsCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}