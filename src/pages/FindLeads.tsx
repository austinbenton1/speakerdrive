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
  const [eventsFilter, setEventsFilter] = useState('');
  const [selectedLeadType, setSelectedLeadType] = useState<string>('all');
  const [showAllEvents, setShowAllEvents] = useState(false);
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
    // Parse URL parameters for all filters
    const urlParams = {
      // Opportunity filter
      event: searchParams.get('event'),
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
      
      // Lead type filter
      type: searchParams.get('type'),
      
      // Main filters
      industry: searchParams.get('industry')?.split(',').filter(Boolean) || [],
      eventFormat: searchParams.get('format')?.split(',').filter(Boolean) || [],
      organization: searchParams.get('organization')?.split(',').filter(Boolean) || [],
      organizationType: searchParams.get('orgType')?.split(',').filter(Boolean) || [],
      pastSpeakers: searchParams.get('speakers')?.split(',').filter(Boolean) || [],
      searchAll: searchParams.get('search') || '',
      jobTitle: searchParams.get('job')?.split(',').filter(Boolean) || [],
      region: searchParams.get('region') || '',
      state: searchParams.get('state')?.split(',').filter(Boolean) || [],
      city: searchParams.get('city')?.split(',').filter(Boolean) || [],
      unlockType: undefined
    };

    // Set event filter if present
    if (urlParams.event) {
      setEventsFilter(urlParams.event);
    }

    // Set opportunity tags if present
    if (urlParams.tags.length > 0) {
      setOpportunityTags(urlParams.tags);
    }

    // Set lead type if specified
    if (urlParams.type && urlParams.type !== 'all') {
      setSelectedLeadType(urlParams.type);
      const selectedType = leadTypes.find(t => t.id === urlParams.type);
      if (selectedType) {
        urlParams.unlockType = selectedType.unlockValue;
      }
    }

    // Set display mode if specified
    const displayParam = searchParams.get('event_display');
    if (displayParam === 'all') {
      setShowAllEvents(true);
    }

    // Set main filters
    setFilters(prev => ({
      ...prev,
      industry: urlParams.industry,
      eventFormat: urlParams.eventFormat,
      organization: urlParams.organization,
      organizationType: urlParams.organizationType,
      pastSpeakers: urlParams.pastSpeakers,
      searchAll: urlParams.searchAll,
      jobTitle: urlParams.jobTitle,
      region: urlParams.region,
      state: urlParams.state,
      city: urlParams.city,
      unlockType: urlParams.unlockType
    }));

    // Determine which sections should be open based on active filters
    const sectionsToOpen = {
      // Event Filters
      jobTitle: urlParams.jobTitle.length > 0,
      eventFormat: urlParams.eventFormat.length > 0,
      industry: urlParams.industry.length > 0,
      pastSpeakers: urlParams.pastSpeakers.length > 0,
      
      // Organization Filters
      moreFilters: urlParams.organization.length > 0, // Organization filter
      organizationType: urlParams.organizationType.length > 0,
      
      // Location Filters
      location: Boolean(urlParams.region || urlParams.state.length || urlParams.city.length),
      
      // Target Audience (based on job title or past speakers)
      targetAudience: urlParams.jobTitle.length > 0 || urlParams.pastSpeakers.length > 0
    };

    // Open sections that have active filters
    setOpenSections(prev => ({
      ...prev,
      ...sectionsToOpen
    }));

    // Set filtering state if any filter is active
    const hasActiveFilters = Boolean(
      urlParams.event ||
      urlParams.tags.length > 0 ||
      urlParams.type !== 'all' ||
      urlParams.industry.length > 0 ||
      urlParams.eventFormat.length > 0 ||
      urlParams.organization.length > 0 ||
      urlParams.organizationType.length > 0 ||
      urlParams.pastSpeakers.length > 0 ||
      urlParams.searchAll ||
      urlParams.jobTitle.length > 0 ||
      urlParams.region ||
      urlParams.state.length > 0 ||
      urlParams.city.length > 0
    );

    if (hasActiveFilters) {
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
      filters.pastSpeakers?.length ||
      filters.searchAll ||
      filters.jobTitle?.length ||
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
    if (filters.jobTitle?.length) {
      results = results.filter(lead => 
        filters.jobTitle.some(job => 
          lead.job_title?.toLowerCase().includes(job.toLowerCase())
        )
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
      pastSpeakers: [],
      searchAll: '',
      unlockType: undefined,
      jobTitle: [],
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
      location: false,
      jobTitle: false,
      moreFilters: false
    });
  };

  const handleLeadClick = (leadId: string) => {
    // Create URL parameters with active filters
    const params = new URLSearchParams();

    // Add event filter if exists
    if (eventsFilter) params.set('event', eventsFilter);

    // Add opportunity tags if any
    if (opportunityTags.length) params.set('tags', opportunityTags.join(','));

    // Add lead type if not 'all'
    if (selectedLeadType !== 'all') params.set('type', selectedLeadType);

    // Add other active filters
    if (filters.industry?.length) params.set('industry', filters.industry.join(','));
    if (filters.eventFormat?.length) params.set('format', filters.eventFormat.join(','));
    if (filters.organization?.length) params.set('organization', filters.organization.join(','));
    if (filters.organizationType?.length) params.set('orgType', filters.organizationType.join(','));
    if (filters.pastSpeakers?.length) params.set('speakers', filters.pastSpeakers.join(','));
    if (filters.searchAll) params.set('search', filters.searchAll);
    if (filters.jobTitle?.length) params.set('job', filters.jobTitle.join(','));
    if (filters.region) params.set('region', filters.region);
    if (filters.state?.length) params.set('state', filters.state.join(','));
    if (filters.city?.length) params.set('city', filters.city.join(','));

    // Add display mode
    if (showAllEvents) params.set('event_display', 'all');

    // Navigate to lead detail with filters
    navigate(`/leads/${leadId}?${params.toString()}`);
  };

  const handleLeadTypeChange = (type: LeadType) => {
    setSelectedLeadType(type);
    const selectedType = leadTypes.find(t => t.id === type);
    
    setFilters(prev => ({
      ...prev,
      unlockType: selectedType?.unlockValue,
      jobTitle: selectedType?.unlockValue === 'Unlock Contact Email' ? prev.jobTitle : []
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