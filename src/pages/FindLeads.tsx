import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useLeadFilters } from '../hooks/useLeadFilters';
import { useAvailableLeads } from '../hooks/useAvailableLeads';
import { useBatchLeads } from '../hooks/useBatchLeads';
import { Users, Calendar, Filter } from 'lucide-react';
import { getUniqueLeads } from '../utils/deduplication';
import SmartFiltersBar from '../components/filters/SmartFiltersBar';
import { supabase } from '../lib/supabase';
import { useRandomSort } from '../hooks/useRandomSort';
import LeadsTable from '../components/leads/LeadsTable';
import LeftSidebarFilters from '../components/filters/LeftSidebarFilters';
import OpportunitiesFilter from '../components/filters/OpportunitiesFilter';
import LocationToggle from '../components/common/LocationToggle';
import { leadTypes, type LeadType } from '../components/filters/lead-type/leadTypeConfig';
import type { Lead } from '../types';

// Local storage key for location preference
const LOCATION_PREFERENCE_KEY = 'speakerdrive_location_preference';

export default function FindLeads() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Initialize batch fetching
  const { batchLeads, loading: batchLoading, error: batchError, stats } = useBatchLeads();

  // Initialize filters from location state if available
  useEffect(() => {
    const state = location.state as { preservedFilters?: any };
    if (state?.preservedFilters) {
      setFilters(state.preservedFilters);
      setEventsFilter(state.preservedFilters.eventsFilter || '');
      setOpportunityTags(state.preservedFilters.opportunityTags || []);
      setSelectedLeadType(state.preservedFilters.selectedLeadType || 'all');
      setShowAllEvents(state.preservedFilters.showAllEvents || false);
      
      // Don't override showAll if it's already set from localStorage
      if (typeof state.preservedFilters.showAll === 'boolean' && !localStorage.getItem(LOCATION_PREFERENCE_KEY)) {
        setShowAll(state.preservedFilters.showAll);
      }
    }
  }, [location.state]);

  const [eventsFilter, setEventsFilter] = useState('');
  const [selectedLeadType, setSelectedLeadType] = useState<string>('all');
  const [showAllEvents, setShowAllEvents] = useState(false);
  
  // Initialize showAll from localStorage, defaulting to true (worldwide)
  const [showAll, setShowAll] = useState(() => {
    const savedPreference = localStorage.getItem(LOCATION_PREFERENCE_KEY);
    return savedPreference ? JSON.parse(savedPreference) : true;
  });

  // Persist showAll value to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(LOCATION_PREFERENCE_KEY, JSON.stringify(showAll));
  }, [showAll]);

  const [opportunityTags, setOpportunityTags] = useState<string[]>([]);
  const [displayedLeads, setDisplayedLeads] = useState<Lead[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [currentLeadIds, setCurrentLeadIds] = useState<string[]>([]);
  
  const {
    filters,
    openSections,
    setFilters,
    setOpenSections,
    toggleSection,
  } = useLeadFilters();

  const { sortConfig } = useRandomSort();

  // Function to apply all filters to leads
  const applyFilters = (leads: Lead[]) => {
    let filtered = [...leads];

    // Apply opportunity tags filter
    if (opportunityTags.length > 0) {
      filtered = filtered.filter(lead => {
        if (!lead.opportunity_tags) return false;
        return opportunityTags.some(tag => lead.opportunity_tags.includes(tag));
      });
    }

    // Apply lead type filter
    if (selectedLeadType !== 'all') {
      filtered = filtered.filter(lead => 
        lead.unlock_type === 'Unlock Event Email' || 
        lead.unlock_type === 'Unlock Event URL'
      );
    }

    // Apply USA location filter
    if (!showAll) {
      filtered = filtered.filter(lead => lead.region === 'United States');
    }

    // Filter by opportunities search term
    if (eventsFilter || opportunityTags.length > 0) {
      filtered = filtered.filter(lead => {
        // Combine all searchable fields
        const searchableText = [
          lead.lead_name,
          lead.event_name,
          lead.keywords,
          lead.subtext,
          lead.job_title,
          lead.organization
        ].filter(Boolean).join(' ').toLowerCase();
        
        // Check text search
        if (eventsFilter && searchableText.includes(eventsFilter.toLowerCase())) {
          return true;
        }
        
        // Check tags
        if (opportunityTags.length > 0) {
          return opportunityTags.some(tag => searchableText.includes(tag.toLowerCase()));
        }
        
        return false;
      });
    }

    // Apply all other filters from the filters object
    Object.entries(filters).forEach(([key, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return;

      switch (key) {
        case 'industry':
          filtered = filtered.filter(lead => 
            filters.industry?.some(industry => 
              lead.industry?.toLowerCase().includes(industry.toLowerCase())
            )
          );
          break;

        case 'eventFormat':
          filtered = filtered.filter(lead => 
            filters.eventFormat?.some(format => 
              lead.event_format?.toLowerCase().includes(format.toLowerCase())
            )
          );
          break;

        case 'organization':
          filtered = filtered.filter(lead => 
            filters.organization?.some(org => 
              lead.organization?.toLowerCase().includes(org.toLowerCase())
            )
          );
          break;

        case 'organizationType':
          filtered = filtered.filter(lead => 
            filters.organizationType?.includes(lead.organization_type || '')
          );
          break;

        case 'jobTitle':
          filtered = filtered.filter(lead => 
            filters.jobTitle?.some(job => 
              lead.job_title?.toLowerCase().includes(job.toLowerCase())
            )
          );
          break;

        case 'region':
          if (filters.region) {
            filtered = filtered.filter(lead => 
              lead.region?.toLowerCase() === filters.region.toLowerCase()
            );
          }
          break;

        case 'state':
          filtered = filtered.filter(lead => 
            filters.state?.some(state => 
              lead.state?.toLowerCase() === state.toLowerCase()
            )
          );
          break;

        case 'city':
          filtered = filtered.filter(lead => 
            filters.city?.some(city => 
              lead.city?.toLowerCase().includes(city.toLowerCase())
            )
          );
          break;

        case 'unlockType':
          if (Array.isArray(filters.unlockType) && filters.unlockType.length > 0) {
            filtered = filtered.filter(lead => 
              filters.unlockType?.includes(lead.unlock_type)
            );
          }
          break;

        case 'pastSpeakers':
          filtered = filtered.filter(lead => 
            filters.pastSpeakers?.some(speaker => 
              lead.past_speakers_events?.toLowerCase().includes(speaker.toLowerCase())
            )
          );
          break;
      }
    });

    return filtered;
  };

  // Memoize filtered leads to prevent unnecessary recalculations
  const filteredLeads = useMemo(() => {
    if (!batchLeads.length) return [];
    
    try {
      // Apply filters to batch leads
      const filtered = applyFilters(batchLeads);
      
      // Apply deduplication
      return getUniqueLeads(filtered);
    } catch (error) {
      console.error('Error processing leads:', error);
      return [];
    }
  }, [
    batchLeads,
    filters,
    opportunityTags,
    selectedLeadType,
    showAll,
    eventsFilter
  ]);

  // Update displayed leads when filtered leads change
  useEffect(() => {
    setIsFiltering(true);
    setDisplayedLeads(filteredLeads);
    setCurrentLeadIds(filteredLeads.map(lead => lead.id));
    setIsFiltering(false);
  }, [filteredLeads]);

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
      targetAudience: urlParams.jobTitle.length > 0 || urlParams.pastSpeakers.length > 0,

      // Lead Type Filter
      unlockType: urlParams.type && urlParams.type !== 'all'
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
      (urlParams.type && urlParams.type !== 'all') ||
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

  // Update displayed leads and IDs when necessary
  useEffect(() => {
    // First apply deduplication to preserve groups
    const uniqueLeads = showAllEvents ? batchLeads : getUniqueLeads(batchLeads);

    // Then apply filters to the deduplicated results
    let results = uniqueLeads;

    // If region is set to something other than United States or Virtual Only,
    // ensure worldwide view is enabled
    if (filters.region && filters.region !== 'United States' && filters.region !== 'Virtual Only') {
      setShowAll(true);
    } else if (filters.region === 'United States') {
      // If region is set to United States, ensure USA-only view is enabled
      setShowAll(false);
    }

    // Handle lead type filtering
    if (selectedLeadType === 'events') {
      results = results.filter(lead => 
        lead.unlock_type === 'Unlock Event Email' || 
        lead.unlock_type === 'Unlock Event URL'
      );
    } else if (selectedLeadType === 'contacts') {
      results = results.filter(lead => 
        lead.unlock_type === 'Unlock Contact Email'
      );
    }

    // Apply USA location filter immediately after deduplication
    if (!showAll) {
      results = results.filter(lead => lead.region === 'United States');
    }
    
    if (hasActiveFilters) {
      // Filter by opportunities search term
      if (eventsFilter || opportunityTags.length > 0) {
        results = results.filter(lead => {
          // Combine all searchable fields
          const searchableText = [
            lead.lead_name,
            lead.event_name,
            lead.keywords,
            lead.subtext,
            lead.job_title,
            lead.organization
          ].filter(Boolean).join(' ').toLowerCase();
          
          // Check text search
          if (eventsFilter && searchableText.includes(eventsFilter.toLowerCase())) {
            return true;
          }
          
          // Check tags
          if (opportunityTags.length > 0) {
            return opportunityTags.some(tag => searchableText.includes(tag.toLowerCase()));
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
      if (filters.unlockType && Array.isArray(filters.unlockType) && filters.unlockType.length > 0) {
        results = results.filter(lead => 
          filters.unlockType.includes(lead.unlock_type)
        );
      }

      // Filter by past speakers
      if (filters.pastSpeakers?.length) {
        results = results.filter(lead => 
          filters.pastSpeakers.some(speaker => 
            lead.past_speakers_events?.toLowerCase().includes(speaker.toLowerCase())
          )
        );
      }
    }

    // Update both states with the filtered results
    setDisplayedLeads(results);
    setCurrentLeadIds(results.map(lead => lead.id));
  }, [batchLeads, eventsFilter, filters, opportunityTags, hasActiveFilters, showAllEvents, showAll]);

  const handleLeadClick = async (leadId: string) => {
    // Build Navigation Params
    const params = new URLSearchParams();

    // Add event filter if exists
    if (eventsFilter) params.set('event', eventsFilter);
    if (opportunityTags.length) params.set('tags', opportunityTags.join(','));
    if (selectedLeadType !== 'all') params.set('type', selectedLeadType);
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
    if (!showAll) params.set('location', 'usa');

    // Use the pre-computed lead IDs
    const currentIndex = currentLeadIds.indexOf(leadId);

    // Navigate immediately
    navigate(`/leads/${leadId}?${params.toString()}`, {
      state: {
        leadIds: currentLeadIds,
        currentIndex,
        fromFindLeads: true,
        returnPath: `/find-leads?${params.toString()}`,
        filters: {
          ...filters,
          eventsFilter,
          opportunityTags,
          selectedLeadType,
          showAllEvents,
          showAll
        }
      }
    });

    // Record visit after navigation (non-blocking)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        supabase.rpc('record_visit', {
          var_lead: leadId,
          var_user: user.id
        });
      }
    } catch (err) {
      // Silently handle errors for visit recording
    }
  };

  const handleLeadTypeChange = (type: LeadType) => {
    setSelectedLeadType(type);
    
    // Reset unlock type filter when changing lead type
    if (type === 'events') {
      setFilters(prev => ({
        ...prev,
        unlockType: ['Unlock Event Email', 'Unlock Event URL'],
        jobTitle: []
      }));
      return;
    }

    if (type === 'contacts') {
      setFilters(prev => ({
        ...prev,
        unlockType: ['Unlock Contact Email'],
        jobTitle: prev.jobTitle
      }));
      return;
    }
    
    setFilters(prev => ({
      ...prev,
      unlockType: [],
      jobTitle: []
    }));
  };

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
    setShowAll(false);
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
      region: false,
      moreFilters: false,
      unlockType: true
    });
  };

  // Memoize unique count calculation
  const uniqueLeadsCount = useMemo(() => 
    getUniqueLeads(displayedLeads).length,
  [displayedLeads]);

  // Calculate USA leads count
  const usaLeadsCount = useMemo(() => {
    const baseLeads = showAllEvents ? batchLeads : getUniqueLeads(batchLeads);
    return baseLeads.filter(lead => lead.region === 'United States').length;
  }, [batchLeads, showAllEvents]);

  const handleUnlockTypeChange = (type: string | undefined) => {
    // If type is undefined, clear the filter
    if (!type) {
      setFilters(prev => ({
        ...prev,
        unlockType: []
      }));
      setSelectedLeadType('all');
      return;
    }

    // Handle unlock type selection
    setFilters(prev => ({
      ...prev,
      unlockType: [type]
    }));

    // Update master toggle based on unlock type
    if (type === 'Unlock Contact Email') {
      setSelectedLeadType('contacts');
    } else if (type === 'Unlock Event Email' || type === 'Unlock Event URL') {
      setSelectedLeadType('events');
    } else {
      setSelectedLeadType('all');
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
        handleUnlockTypeChange={handleUnlockTypeChange}
        selectedUnlockType={filters.unlockType}
        showAllEvents={showAllEvents}
        onViewToggle={() => setShowAllEvents(!showAllEvents)}
        showAll={showAll}
        onLocationToggle={() => setShowAll(!showAll)}
        totalCount={displayedLeads.length}
        uniqueCount={uniqueLeadsCount}
        usaCount={usaLeadsCount}
        selectedLeadType={selectedLeadType as 'all' | 'contacts' | 'events'}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Lead Type Toggle */}
          <div className="w-[700px] mb-6">
            <div className="flex items-center gap-4">
              <div className="inline-flex bg-white rounded-lg shadow-sm border border-gray-200/75 p-0.5">
                {[
                  { id: 'all', label: 'All', icon: Filter, baseColor: 'gray' },
                  { id: 'contacts', label: 'Contacts', icon: Users, baseColor: 'blue' },
                  { id: 'events', label: 'Events', icon: Calendar, baseColor: 'emerald' }
                ].map((type) => {
                  const isSelected = selectedLeadType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => handleLeadTypeChange(type.id)}
                      className={`
                        relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md
                        transition-all duration-200
                        ${isSelected
                          ? type.id === 'events' 
                            ? 'text-emerald-900 bg-emerald-100 shadow-sm border border-emerald-200'
                            : type.id === 'contacts'
                              ? 'text-blue-900 bg-blue-100 shadow-sm border border-blue-200'
                              : 'text-gray-900 bg-gray-100 shadow-sm border border-gray-200'
                          : `text-${type.baseColor}-700 hover:text-${type.baseColor}-800 hover:bg-${type.baseColor}-50/50 border border-transparent`
                        }
                      `}
                    >
                      <type.icon className={`w-3.5 h-3.5 ${
                        isSelected 
                          ? type.id === 'events'
                            ? 'text-emerald-600'
                            : type.id === 'contacts'
                              ? 'text-blue-600'
                              : 'text-gray-600'
                          : `text-${type.baseColor}-500`
                      }`} />
                      {type.label}
                      {isSelected && (
                        <span className={`absolute -bottom-[1px] left-2 right-2 h-0.5 rounded-full ${
                          type.id === 'events'
                            ? 'bg-emerald-500'
                            : type.id === 'contacts'
                              ? 'bg-blue-500'
                              : 'bg-gray-500'
                        }`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Location Toggle */}
              <LocationToggle
                isUSAOnly={!showAll}
                onChange={(isUSAOnly) => setShowAll(!isUSAOnly)}
              />
            </div>

            <div className="mt-4">
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
          </div>
          
          {hasActiveFilters && (
            <SmartFiltersBar
              filters={filters}
              onRemoveFilter={(key, value) => {
                setFilters(prev => ({
                  ...prev,
                  [key]: Array.isArray(prev[key])
                    ? (prev[key] as string[]).filter(v => v !== value)
                    : typeof prev[key] === 'string' && prev[key] === value
                      ? ''
                      : prev[key]
                }));
              }}
              onClearAllFilters={handleResetFilters}
            />
          )}

          <div className="bg-white border border-gray-200 rounded-lg mt-6">
            <LeadsTable 
              leads={displayedLeads}
              loading={batchLoading}
              onResetFilters={handleResetFilters}
              onLeadClick={handleLeadClick}
              showAllEvents={showAllEvents}
            />
          </div>
        </div>
      </div>
    </div>
  );
}