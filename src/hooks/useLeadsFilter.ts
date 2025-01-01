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
  selectedEventFormats: string[];
  selectedOrgTypes: string[];
  organization: string;
  pastSpeakers: string;
  searchAll: string;
  unlockType?: string;
}

export function useLeadsFilter(leads: Lead[], filters: FilterParams) {
  return useMemo(() => {
    let filteredLeads = [...leads];

    // Filter by opportunities search term
    if (filters.opportunitiesFilter) {
      const searchTerm = filters.opportunitiesFilter.toLowerCase();
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
    if (filters.selectedLeadTypes.length > 0) {
      filteredLeads = filteredLeads.filter(lead => {
        const normalizedLeadType = lead.lead_type.toLowerCase();
        return filters.selectedLeadTypes.some(type => type.toLowerCase() === normalizedLeadType);
      });

      // Apply type-specific filters
      if (filters.selectedLeadTypes.length === 1) {
        if (filters.selectedLeadTypes[0] === 'Contact' && filters.jobTitle) {
          filteredLeads = filteredLeads.filter(lead => 
            lead.focus?.toLowerCase().includes(filters.jobTitle!.toLowerCase())
          );
        } else if (filters.selectedLeadTypes[0] === 'Event' && filters.targetAudience) {
          filteredLeads = filteredLeads.filter(lead => 
            lead.focus?.toLowerCase().includes(filters.targetAudience!.toLowerCase())
          );
        }
      }

      // Apply unlock type filter for Events
      if (filters.selectedEventUnlockTypes?.length === 1 && filters.selectedLeadTypes[0] === 'Event') {
        filteredLeads = filteredLeads.filter(lead => 
          filters.selectedEventUnlockTypes![0] === (lead.unlock_type.replace("Unlock ", ""))
        );
      }
    }

    // Filter by industry
    if (filters.selectedIndustries.length > 0) {
      filteredLeads = filteredLeads.filter(lead =>
        filters.selectedIndustries.some(industry => 
          lead.industry.toLowerCase() === industry.toLowerCase()
        )
      );
    }

    // Filter by location
    if (filters.selectedLocations.length > 0) {
      filteredLeads = filteredLeads.filter(lead =>
        filters.selectedLocations.some(location => 
          lead.location?.toLowerCase() === location.toLowerCase()
        )
      );
    }

    // Filter by event format
    if (filters.selectedEventFormats.length > 0) {
      filteredLeads = filteredLeads.filter(lead =>
        filters.selectedEventFormats.some(format => 
          lead.event_format?.toLowerCase() === format.toLowerCase()
        )
      );
    }

    // Filter by organization type
    if (filters.selectedOrgTypes.length > 0) {
      filteredLeads = filteredLeads.filter(lead =>
        filters.selectedOrgTypes.some(orgType => 
          lead.organization_type?.toLowerCase() === orgType.toLowerCase()
        )
      );
    }

    // Filter by organization name
    if (filters.organization) {
      const orgSearch = filters.organization.toLowerCase();
      filteredLeads = filteredLeads.filter(lead =>
        lead.organization?.toLowerCase().includes(orgSearch)
      );
    }

    // Filter by past speakers & experts
    if (filters.pastSpeakers) {
      const speakersSearch = filters.pastSpeakers.toLowerCase();
      filteredLeads = filteredLeads.filter(lead =>
        lead.event_info?.toLowerCase().includes(speakersSearch)
      );
    }

    // Global search across all fields
    if (filters.searchAll) {
      const globalSearch = filters.searchAll.toLowerCase();
      filteredLeads = filteredLeads.filter(lead => {
        const searchFields = [
          lead.lead_name,
          lead.focus,
          lead.industry,
          lead.organization,
          lead.event_info,
          lead.event_name,
          lead.location
        ];

        return searchFields.some(field => 
          field?.toLowerCase().includes(globalSearch)
        );
      });
    }

    // Quick Lead Type filter - applied last
    if (filters.unlockType) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.unlock_type === filters.unlockType
      );
    }

    return filteredLeads;
  }, [leads, filters]);
}