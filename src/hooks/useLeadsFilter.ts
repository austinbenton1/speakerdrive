import { useMemo } from 'react';
import type { Lead } from '../types';

interface FilterParams {
  opportunitiesFilter: string;
  selectedLeadTypes: string[];
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
        return searchFields.some(field => field?.toLowerCase().includes(searchTerm));
      });
    }

    // Filter by lead type
    if (filters.selectedLeadTypes.length > 0) {
      filteredLeads = filteredLeads.filter(lead => {
        const normalizedLeadType = lead.lead_type.toLowerCase();
        return filters.selectedLeadTypes.some(type => type.toLowerCase() === normalizedLeadType);
      });
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
        return searchFields.some(field => field?.toLowerCase().includes(globalSearch));
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