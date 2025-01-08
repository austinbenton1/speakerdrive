import { useState, useEffect } from 'react';
import type { FilterOptions, OpenSections } from '../types';

export function useLeadFilters() {
  const [selectedLeadTypes, setSelectedLeadTypes] = useState<string[]>(['Events', 'Contacts']);
  const [selectedEventUnlockTypes, setSelectedEventUnlockTypes] = useState<string[]>(['Event Email', 'Event URL']);
  const [filters, setFilters] = useState<FilterOptions>({
    targetAudience: [],
    jobTitle: [],  
    searchEvent: '',
    organization: [],
    pastSpeakers: [],
    searchAll: '',
    location: [],
    industry: [],
    timeframe: [],
    eventFormat: [],
    organizationType: [],
    region: '',
    state: [],
    city: []
  });

  const [openSections, setOpenSections] = useState<OpenSections>({
    eventFormat: false,
    industry: false,
    pastSpeakers: false,
    moreFilters: false,
    organizationType: false,
    location: false,
    jobTitle: true, // Set to true by default
    region: false
  });

  useEffect(() => {
    if (filters.region !== 'United States') {
      setFilters(prev => ({
        ...prev,
        state: []
      }));
    }
  }, [filters.region]);

  const toggleLeadType = (type: string) => {
    setSelectedLeadTypes(prev => {
      const newTypes = prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type];
      
      // If only Contacts is selected, set unlock type to Contact Email
      if (newTypes.length === 1 && newTypes[0] === 'Contacts') {
        setFilters(prev => ({ ...prev, unlockType: 'Unlock Contact Email' }));
        setOpenSections(prev => ({ ...prev, jobTitle: true }));
      } 
      // If only Events is selected, clear job title
      else if (newTypes.length === 1 && newTypes[0] === 'Events') {
        setFilters(prev => ({ ...prev, jobTitle: [], unlockType: undefined }));
        setOpenSections(prev => ({ ...prev, jobTitle: false }));
      }
      // If no types are selected, add both back
      else if (newTypes.length === 0) {
        return ['Events', 'Contacts'];
      }
      
      return newTypes;
    });
  };

  const toggleEventUnlockType = (type: string) => {
    setSelectedEventUnlockTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      }
      return [...prev, type];
    });
  };

  const toggleSection = (section: keyof OpenSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return {
    selectedLeadTypes,
    selectedEventUnlockTypes,
    filters,
    openSections,
    setFilters,
    setOpenSections,
    toggleLeadType,
    toggleEventUnlockType,
    toggleSection,
  };
}