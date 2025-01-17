import { useMemo } from 'react';
import type { Lead } from '../types';

interface FilterParams {
  opportunitiesFilter: string;
  selectedLeadTypes: string[];
  selectedIndustries: string[];
  selectedEventFormats: string[];
  organization: string[];
  organizationType: string[];
  pastSpeakers: string[];
  searchAll: string;
  unlockType?: string;
  targetAudience: string[];
  jobTitle: string;
  region: string;
  state: string[];
  city: string[];
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
          lead.keywords
        ];
        return searchFields.some(field => field?.toLowerCase().includes(searchTerm));
      });
    }

    // Filter by Event Format - only if formats are selected
    if (filters.selectedEventFormats && filters.selectedEventFormats.length > 0) {
      const validFormats = filters.selectedEventFormats.map(format => format.toLowerCase().trim());
      const includeOthers = validFormats.includes('others');
      const standardFormats = ['conference', 'summit', 'workshop/seminar', 'tradeshow/convention', 'forum/roundtable', 'consulting potential'].map(f => f.toLowerCase());
      
      filteredLeads = filteredLeads.filter(lead => {
        // If no event format and 'Others' is selected, include it
        if (!lead.event_format) return includeOthers;
        
        // Get the event format and normalize it
        const leadFormat = lead.event_format.toLowerCase().trim();
        
        // If 'Others' is selected and the format doesn't match any standard format, include it
        if (includeOthers && !standardFormats.includes(leadFormat)) {
          return true;
        }
        
        // Check if the lead's format matches any of the selected formats
        return validFormats.includes(leadFormat);
      });
    }

    // Filter by Event Category (industry) - only if categories are selected
    if (filters.selectedIndustries && filters.selectedIndustries.length > 0) {
      const validIndustries = filters.selectedIndustries.map(industry => industry.toLowerCase().trim());
      
      filteredLeads = filteredLeads.filter(lead => {
        // Skip if lead has no industry
        if (!lead.industry) return false;
        
        // Get all industries from the lead (they might be comma-separated)
        const leadIndustries = lead.industry
          .split(',')
          .map(ind => ind.toLowerCase().trim())
          .filter(Boolean);
        
        // Check if any of the lead's industries match any of the selected industries
        return leadIndustries.some(leadIndustry => 
          validIndustries.some(validIndustry => 
            leadIndustry.includes(validIndustry) || validIndustry.includes(leadIndustry)
          )
        );
      });
    }

    // Filter by Event Speakers - only if there are speaker tags
    if (filters.pastSpeakers && filters.pastSpeakers.length > 0) {
      filteredLeads = filteredLeads.filter(lead => {
        // Skip if lead has no past speakers
        if (!lead.event_info) return false;
        
        const eventInfo = lead.event_info.toLowerCase();
        return filters.pastSpeakers.some(speaker => 
          eventInfo.includes(speaker.toLowerCase())
        );
      });
    }

    // Filter by Region - only if region is specified
    if (filters.region) {
      const searchRegion = filters.region.toLowerCase().trim();
      
      filteredLeads = filteredLeads.filter(lead => {
        // Skip if lead has no region
        if (!lead.region) return false;
        
        const leadRegion = lead.region.toLowerCase().trim();
        return leadRegion === searchRegion;
      });
      
      // Filter by State - only if region is United States and states are selected
      if (filters.region === 'United States' && filters.state.length > 0) {
        const validStates = filters.state.map(state => state.toLowerCase().trim());
        
        filteredLeads = filteredLeads.filter(lead => {
          // Skip if lead has no state
          if (!lead.state) return false;
          
          const leadState = lead.state.toLowerCase().trim();
          return validStates.includes(leadState);
        });
      }

      // Filter by City - only if cities are selected and region is not Virtual Only
      if (filters.city.length > 0 && filters.region !== 'Virtual Only') {
        const validCities = filters.city.map(city => city.toLowerCase().trim());
        
        filteredLeads = filteredLeads.filter(lead => {
          // Skip if lead has no city
          if (!lead.city) return false;
          
          const leadCity = lead.city.toLowerCase().trim();
          // Check if any of the selected cities is contained in the lead's city field
          return validCities.some(city => leadCity.includes(city));
        });
      }
    }

    // Filter by Organization
    if (filters.organization && filters.organization.length > 0) {
      const searchTerms = filters.organization.map(org => org.toLowerCase());
      filteredLeads = filteredLeads.filter(lead =>
        lead.organization && searchTerms.some(term => lead.organization?.toLowerCase().includes(term))
      );
    }

    // Filter by organization type
    if (filters.organizationType && filters.organizationType.length > 0) {
      filteredLeads = filteredLeads.filter(lead =>
        lead.organization_type && filters.organizationType.includes(lead.organization_type)
      );
    }

    // Filter by job title
    if (filters.jobTitle && filters.jobTitle.length > 0) {
      const jobTitles = filters.jobTitle.map(title => title.toLowerCase());
      filteredLeads = filteredLeads.filter(lead => {
        // Skip if lead has no job title
        if (!lead.job_title) return false;
        
        const leadJobTitle = lead.job_title.toLowerCase();
        // Check if any of our search job titles appear in the lead's job title
        return jobTitles.some(searchTitle => leadJobTitle.includes(searchTitle));
      });
    }

    // Filter by past speakers
    if (filters.pastSpeakers && filters.pastSpeakers.length > 0) {
      filteredLeads = filteredLeads.filter(lead => {
        // Skip if lead has no past speakers
        if (!lead.event_info) return false;
        
        const eventInfo = lead.event_info.toLowerCase();
        return filters.pastSpeakers.some(speaker => 
          eventInfo.includes(speaker.toLowerCase())
        );
      });
    }

    // Filter by lead type
    if (filters.selectedLeadTypes.length > 0) {
      filteredLeads = filteredLeads.filter(lead => {
        const normalizedLeadType = lead.lead_type.toLowerCase();
        return filters.selectedLeadTypes.some(type => 
          type.toLowerCase() === normalizedLeadType
        );
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
          lead.event_name
        ];
        return searchFields.some(field => field?.toLowerCase().includes(globalSearch));
      });
    }

    // Quick Lead Type filter - applied last
    if (filters.unlockType) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.unlock_type.toLowerCase() === filters.unlockType.toLowerCase()
      );
    }

    return filteredLeads;
  }, [leads, filters]);
}