import { useMemo } from 'react';
import type { Lead } from '../types';

interface FilterParams {
  opportunitiesFilter: string;
  selectedLeadTypes: string[];
  jobTitle?: string;
  targetAudience?: string;
  selectedEventUnlockTypes?: string[];
  selectedIndustries: string[];
  selectedLocations: string[];
  selectedDomains: string[];
  organization: string;
  pastSpeakers: string;
  searchAll: string;
}

export function useLeadsFilter(leads: Lead[], { 
  opportunitiesFilter, 
  selectedLeadTypes,
  jobTitle,
  targetAudience,
  selectedEventUnlockTypes = [],
  selectedIndustries,
  selectedLocations,
  selectedDomains,
  organization,
  pastSpeakers,
  searchAll
}: FilterParams) {
  return useMemo(() => {
    let filteredLeads = leads;

    // Filter by search term
    if (opportunitiesFilter) {
      const searchTerm = opportunitiesFilter.toLowerCase();
      filteredLeads = filteredLeads.filter(lead => {
        const searchFields = [
          lead.lead_name,
          lead.focus,
          lead.industry,
          lead.organization,
          lead.event_info,
          lead.event_name
        ];

        return searchFields.some(field => 
          field?.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Filter by lead type
    if (selectedLeadTypes.length > 0) {
      filteredLeads = filteredLeads.filter(lead => {
        const normalizedLeadType = lead.lead_type.toLowerCase();
        return selectedLeadTypes.some(type => type.toLowerCase() === normalizedLeadType);
      });

      // Apply type-specific filters only if a single type is selected
      if (selectedLeadTypes.length === 1) {
        if (selectedLeadTypes[0] === 'Contact' && jobTitle) {
          filteredLeads = filteredLeads.filter(lead => 
            lead.focus?.toLowerCase().includes(jobTitle.toLowerCase())
          );
        } else if (selectedLeadTypes[0] === 'Event' && targetAudience) {
          filteredLeads = filteredLeads.filter(lead => 
            lead.focus?.toLowerCase().includes(targetAudience.toLowerCase())
          );
        }
      }

      // Apply unlock type filter for Events
      if (selectedEventUnlockTypes.length === 1 && selectedLeadTypes[0] === 'Event') {
        filteredLeads = filteredLeads.filter(lead => 
          selectedEventUnlockTypes[0] === (lead.unlock_type.replace("Unlock ", ""))
        );
      }
    }

    // Filter by industry if any industries are selected
    if (selectedIndustries.length > 0) {
      filteredLeads = filteredLeads.filter(lead =>
        selectedIndustries.some(industry => 
          lead.industry.toLowerCase() === industry.toLowerCase()
        )
      );
    }

    // Filter by location if any locations are selected
    if (selectedLocations.length > 0) {
      filteredLeads = filteredLeads.filter(lead =>
        selectedLocations.some(location => 
          lead.location?.toLowerCase() === location.toLowerCase()
        )
      );
    }

    // Filter by domain type if any domains are selected
    if (selectedDomains.length > 0) {
      filteredLeads = filteredLeads.filter(lead =>
        selectedDomains.some(domain => 
          lead.domain_type.toLowerCase() === domain.toLowerCase()
        )
      );
    }

    // Filter by organization name
    if (organization) {
      const orgSearch = organization.toLowerCase();
      filteredLeads = filteredLeads.filter(lead =>
        lead.organization?.toLowerCase().includes(orgSearch)
      );
    }

    // Filter by past speakers & experts (event info)
    if (pastSpeakers) {
      const speakersSearch = pastSpeakers.toLowerCase();
      filteredLeads = filteredLeads.filter(lead =>
        lead.event_info?.toLowerCase().includes(speakersSearch)
      );
    }

    // Global search across all fields
    if (searchAll) {
      const globalSearch = searchAll.toLowerCase();
      filteredLeads = filteredLeads.filter(lead => {
        const searchFields = [
          lead.lead_name,
          lead.focus,
          lead.industry,
          lead.organization,
          lead.event_info,
          lead.event_name,
          lead.domain_type,
          lead.location
        ];

        return searchFields.some(field => 
          field?.toLowerCase().includes(globalSearch)
        );
      });
    }

    return filteredLeads;
  }, [
    leads, 
    opportunitiesFilter, 
    selectedLeadTypes, 
    jobTitle, 
    targetAudience, 
    selectedEventUnlockTypes,
    selectedIndustries,
    selectedLocations,
    selectedDomains,
    organization,
    pastSpeakers,
    searchAll
  ]);
}