import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useLeadFilters } from '../hooks/useLeadFilters';
import { useAvailableLeads } from '../hooks/useAvailableLeads';
import { useUnlockedLeadsData } from '../hooks/useUnlockedLeadsData';
import { useIsMobile } from '../hooks/useIsMobile';
import { Users, Calendar, Filter } from 'lucide-react';
import SmartFiltersBar from '../components/filters/SmartFiltersBar';
import { supabase } from '../lib/supabase';
import { useRandomSort } from '../hooks/useRandomSort';
import LeadsTable from '../components/leads/LeadsTable';
import LeadListMobile from '../components/leads/LeadListMobile';
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
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL parameters and location state
  useEffect(() => {
    // Check URL parameters
    const eventParam = searchParams.get('event');
    const organizationParam = searchParams.get('organization');
    const showUnlocksParam = searchParams.get('show_unlocks');
    
    // If we have URL parameters, set them as filters
    if (eventParam || organizationParam || showUnlocksParam) {
      // Add event to opportunity tags if present
      if (eventParam) {
        setOpportunityTags(prev => {
          if (!prev.includes(eventParam)) {
            return [...prev, eventParam];
          }
          return prev;
        });
      }

      // Set organization filter and expand the section if present
      if (organizationParam) {
        setFilters(prev => ({
          ...prev,
          organization: [organizationParam]
        }));
        // Expand both the organization section and its parent section
        setOpenSections(prev => ({
          ...prev,
          organization: true,
          moreFilters: true
        }));
      }

      // Set show unlocks state if present
      if (showUnlocksParam) {
        // Do nothing since we're only using URL parameter now
      }
    }

    // Handle location state filters
    const state = location.state as { preservedFilters?: any };
    if (state?.preservedFilters) {
      setFilters(prev => ({
        ...prev,
        ...state.preservedFilters,
        // Preserve organization from URL if it exists
        organization: organizationParam ? [organizationParam] : state.preservedFilters.organization || []
      }));
      setEventsFilter(state.preservedFilters.eventsFilter || '');
      setOpportunityTags(prev => {
        const tags = state.preservedFilters.opportunityTags || [];
        // Add event from URL if it exists and isn't already in the tags
        return eventParam && !tags.includes(eventParam) 
          ? [...tags, eventParam]
          : tags;
      });
      setSelectedLeadType(state.preservedFilters.selectedLeadType || 'all', false);
      setShowAll(state.preservedFilters.showAll || false);
      
      if (typeof state.preservedFilters.showAll === 'boolean' && !localStorage.getItem(LOCATION_PREFERENCE_KEY)) {
        setShowAll(state.preservedFilters.showAll);
      }
    }
  }, [location.state, searchParams]);

  const [eventsFilter, setEventsFilter] = useState('');
  const [selectedLeadType, setSelectedLeadType] = useState<'all' | 'contacts' | 'events'>('all');
  const [showAllEvents, setShowAllEvents] = useState(() => {
    const savedPreference = localStorage.getItem('showAllEvents');
    return savedPreference ? JSON.parse(savedPreference) : false;
  });
  
  // Initialize showAll from localStorage, defaulting to false (USA only)
  const [showAll, setShowAll] = useState(() => {
    const savedPreference = localStorage.getItem(LOCATION_PREFERENCE_KEY);
    return savedPreference ? JSON.parse(savedPreference) : false;
  });
  // Remove useState for showUnlocks and only use URL parameter
  const showUnlocks = searchParams.get('show_unlocks') === 'true';
  const [filters, setFilters] = useState<LeadFilters>({
    industry: [],
    eventFormat: [],
    organization: [],
    organizationType: [],
    pastSpeakers: [],
    searchAll: '',
    unlockType: [], // Initialize as empty array instead of undefined
    region: '',
    state: [],
    city: []
  });

  // Persist showAll value to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(LOCATION_PREFERENCE_KEY, JSON.stringify(showAll));
  }, [showAll]);

  // Remove localStorage effect for showUnlocks since we're only using URL parameter now

  // Update URL when filters change
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    
    // Update show_unlocks parameter
    if (showUnlocks) {
      newParams.set('show_unlocks', 'true');
    } else {
      newParams.delete('show_unlocks');
    }

    setSearchParams(newParams);
  }, [showUnlocks, setSearchParams]);

  const [opportunityTags, setOpportunityTags] = useState<string[]>([]);
  const { leads: availableLeads, loading, error, totalLeads, allLeadsLoaded } = useAvailableLeads();
  const { recordedLeads: unlockedLeads = [] } = useUnlockedLeadsData();
  const unlockedLeadIds = useMemo(() => 
    new Set(unlockedLeads?.map(ul => ul.lead_id) || []), 
    [unlockedLeads]
  );
  const [currentLeadIds, setCurrentLeadIds] = useState<string[]>([]);
  
  const {
    selectedEventUnlockTypes,
    openSections,
    setOpenSections,
    toggleEventUnlockType,
    toggleSection,
    handleUnlockTypeChange
  } = useLeadFilters();

  // Function to handle lead type changes
  const handleLeadTypeChange = (type: 'all' | 'contacts' | 'events') => {
    setSelectedLeadType(type);
    
    // Update unlock type filters based on lead type
    if (type === 'contacts') {
      setFilters(prev => ({
        ...prev,
        unlockType: ['Unlock Contact Email']
      }));
    } else if (type === 'events') {
      setFilters(prev => ({
        ...prev,
        unlockType: ['Unlock Event Email', 'Unlock Event URL']
      }));
    } else {
      // For 'all', select all unlock types
      setFilters(prev => ({
        ...prev,
        unlockType: ['Unlock Contact Email', 'Unlock Event Email', 'Unlock Event URL']
      }));
    }
  };

  // Get random sort configuration from profile
  const { sortConfig } = useRandomSort();
  
  // These are now only for UI-triggered manual sorting
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const isMobile = useIsMobile();

  // Calculate if there are active filters
  const hasActiveFilters = useMemo(() => {
    return !!(
      eventsFilter ||
      filters.industry?.length ||
      filters.eventFormat?.length ||
      filters.organization?.length ||
      filters.organizationType?.length ||
      filters.pastSpeakers?.length ||
      filters.searchAll ||
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
    filters.region,
    filters.state,
    filters.city,
    selectedLeadType,
    opportunityTags
  ]);

  // Process leads while preserving server-side sort unless manual sort is applied
  const processedLeads = useMemo(() => {
    let results = [...availableLeads];

    // Remove unlocked leads if toggle is in 'Unlocks Hidden' state
    if (!showUnlocks) {
      results = results.filter(lead => !unlockedLeadIds.has(lead.id));
    }

    // Apply USA-only filter if enabled
    if (!showAll) {
      results = results.filter(lead => lead.region === 'United States');
    }

    // Handle lead type filtering
    if (selectedLeadType !== 'all') {
      results = results.filter(lead => {
        if (selectedLeadType === 'contacts') {
          return lead.lead_type === 'Contact';
        } else {
          return lead.lead_type === 'Event';
        }
      });
    }

    // Apply unlock type filter if any are selected
    if (filters.unlockType && filters.unlockType.length > 0) {
      results = results.filter(lead => 
        lead.unlock_type && filters.unlockType.includes(lead.unlock_type)
      );
    }

    // Filter by opportunities search term
    if (eventsFilter) {
      results = results.filter(lead => {
        // Combine all searchable fields
        const searchableText = [
          lead.lead_name,
          lead.event_name,
          lead.keywords,
          lead.subtext,
          lead.organization,
          lead.industry,
          lead.past_speakers,
          lead.focus,
          lead.job_title
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchableText.includes(eventsFilter.toLowerCase());
      });
    }

    // First deduplicate leads by ID
    results = Array.from(
      new Map(results.map(lead => [lead.id, lead])).values()
    );

    // Apply deduplication if not showing all events
    if (!showAllEvents) {
      results = results.filter(lead => lead.lead_type === 'Contact' || (lead.lead_type === 'Event' && lead.dedup_value === 2));
    }

    // Apply filters
    if (hasActiveFilters) {
      results = results.filter(lead => {
        // Event Format Filter
        if (filters.eventFormat.length > 0 && !filters.eventFormat.includes(lead.event_format)) {
          return false;
        }

        // Industry Filter
        if (filters.industry.length > 0 && !filters.industry.includes(lead.industry)) {
          return false;
        }

        // Past Speakers Filter
        if (filters.pastSpeakers.length > 0) {
          const matchesSpeaker = filters.pastSpeakers.some(speaker =>
            lead.past_speakers?.toLowerCase().includes(speaker.toLowerCase())
          );
          if (!matchesSpeaker) return false;
        }

        // Organization Filter
        if (filters.organization.length > 0) {
          const matchesOrg = filters.organization.some(org =>
            lead.organization?.toLowerCase().includes(org.toLowerCase())
          );
          if (!matchesOrg) return false;
        }

        return true;
      });
    }

    // Apply region filter
    if (filters.region) {
      results = results.filter(lead => {
        if (filters.region === 'Virtual Only') {
          return lead.region === 'Virtual Only';
        }
        return lead.region === filters.region;
      });
    }

    // Apply opportunity tags filter
    if (opportunityTags.length > 0) {
      results = results.filter(lead => {
        return opportunityTags.every(tag => {
          const tagLower = tag.toLowerCase();
          const searchableText = [
            lead.lead_name,
            lead.event_name,
            lead.keywords,
            lead.subtext,
            lead.organization,
            lead.industry,
            lead.past_speakers,
            lead.focus,
            lead.job_title
          ].filter(Boolean).join(' ').toLowerCase();
          
          return searchableText.includes(tagLower);
        });
      });
    }

    // Only apply manual sorting if user has explicitly set it
    if (sortField && sortDirection) {
      results.sort((a, b) => {
        const aValue = a[sortField as keyof typeof a];
        const bValue = b[sortField as keyof typeof b];
        
        if (!aValue && !bValue) return 0;
        if (!aValue) return sortDirection === 'asc' ? 1 : -1;
        if (!bValue) return sortDirection === 'asc' ? -1 : 1;
        
        return sortDirection === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }

    return results;
  }, [
    availableLeads,
    showUnlocks,
    unlockedLeadIds,
    showAll,
    selectedLeadType,
    eventsFilter,
    showAllEvents,
    hasActiveFilters,
    filters,
    opportunityTags,
    sortField,
    sortDirection
  ]);

  // Update current lead IDs based on processed leads
  useEffect(() => {
    const newLeadIds = processedLeads.map(lead => lead.id);
    if (JSON.stringify(newLeadIds) !== JSON.stringify(currentLeadIds)) {
      setCurrentLeadIds(newLeadIds);
    }
  }, [processedLeads]);

  // Calculate total leads count
  const totalLeadsCount = useMemo(() => {
    return processedLeads?.length || 0;
  }, [processedLeads]);

  // Calculate unique leads count
  const uniqueLeadsCount = useMemo(() => {
    return new Set(processedLeads?.map(lead => lead.id) || []).size;
  }, [processedLeads]);

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

  const handleResetFilters = () => {
    setFilters({
      industry: [],
      eventFormat: [],
      organization: [],
      organizationType: [],
      pastSpeakers: [],
      searchAll: '',
      unlockType: [], // Initialize as empty array instead of undefined
      region: '',
      state: [],
      city: []
    });
    setEventsFilter('');
    setOpportunityTags([]);
    setSelectedLeadType('all', false);
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
      region: false,
      moreFilters: false,
      unlockType: true
    });
  };

  const handleSortChange = (field: string, direction: 'asc' | 'desc' | null) => {
    setSortField(field);
    setSortDirection(direction);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      <div className="flex-1 flex overflow-y-auto">
        {/* Left Sidebar - Hidden in mobile */} 
        {!isMobile && (
          <div className="border-r border-gray-200 bg-white py-6 flex-shrink-0 sticky top-0">
            <LeftSidebarFilters
              filters={filters}
              setFilters={setFilters}
              openSections={openSections}
              setOpenSections={setOpenSections}
              toggleSection={toggleSection}
              handleUnlockTypeChange={handleUnlockTypeChange}
              onResetFilters={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
              selectedLeadType={selectedLeadType}
              setSelectedLeadType={setSelectedLeadType}
              showAllEvents={showAllEvents}
              setShowAllEvents={setShowAllEvents}
              eventsFilter={eventsFilter}
              setEventsFilter={setEventsFilter}
              opportunityTags={opportunityTags}
              setOpportunityTags={setOpportunityTags}
              showAll={showAll}
              setShowAll={setShowAll}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="p-8">
            <div className="sticky top-0 z-10 bg-gray-50 pb-4">
              <div className="flex items-center justify-between">
                {/* Lead Type Toggle */}
                <div className="w-[700px] mb-6">
                  <div className="flex items-center gap-4">
                    <div className="inline-flex bg-white rounded-lg shadow-sm border border-gray-200/75 p-0.5">
                      {[
                        { id: 'all' as const, label: 'All', icon: Filter, baseColor: 'gray' },
                        { id: 'contacts' as const, label: 'Contacts', icon: Users, baseColor: 'blue' },
                        { id: 'events' as const, label: 'Events', icon: Calendar, baseColor: 'emerald' }
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

                    {/* Location Toggle only */}
                    <div className="flex items-center gap-2">
                      <LocationToggle
                        isUSAOnly={!showAll}
                        onChange={(isUSAOnly) => setShowAll(!isUSAOnly)}
                      />
                    </div>
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
              </div>

              {hasActiveFilters && (
                <div className="sticky top-[144px] z-10 bg-gray-50">
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
                </div>
              )}

              <div className="bg-white border border-gray-200 rounded-lg mt-6">
                {/* Conditional Rendering based on viewport */}
                {isMobile ? (
                  <LeadListMobile 
                    leads={processedLeads}
                    onLeadClick={handleLeadClick}
                    loading={loading}
                  />
                ) : (
                  <LeadsTable 
                    leads={processedLeads}
                    loading={loading}
                    onResetFilters={handleResetFilters}
                    onLeadClick={handleLeadClick}
                    showAllEvents={showAllEvents}
                    uniqueCount={uniqueLeadsCount}
                    selectedLeadType={selectedLeadType}
                    filters={filters}
                    eventsFilter={eventsFilter}
                    opportunityTags={opportunityTags}
                    showAll={showAll}
                    totalLeads={totalLeadsCount}
                    allLeadsLoaded={allLeadsLoaded}
                    onSortChange={handleSortChange}
                    sortField={sortField}
                    sortDirection={sortDirection}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}