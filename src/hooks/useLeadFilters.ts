import { useState, useEffect } from 'react';
import type { FilterOptions, OpenSections } from '../types';

export function useLeadFilters() {
  const [selectedLeadTypes, setSelectedLeadTypes] = useState<string[]>(['Events', 'Contacts']);
  const [selectedEventUnlockTypes, setSelectedEventUnlockTypes] = useState<string[]>(['Event Email', 'Event URL']);
  const [filters, setFilters] = useState<FilterOptions>({
    industry: [],
    eventFormat: [],
    organization: [],
    organizationType: [],
    pastSpeakers: [],
    searchAll: '',
    unlockType: undefined,
    region: '',
    state: [],
    city: []
  });

  const [openSections, setOpenSections] = useState<OpenSections>({
    eventFormat: false,
    industry: false,
    organization: false,
    organizationType: false,
    location: false,
    unlockType: false,
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
        setFilters(prev => ({ 
          ...prev, 
          unlockType: 'Unlock Contact Email',
          jobTitle: prev.jobTitle // Preserve job title filter
        }));
        setOpenSections(prev => ({ ...prev, jobTitle: true }));
      } 
      // If only Events is selected, clear job title
      else if (newTypes.length === 1 && newTypes[0] === 'Events') {
        setFilters(prev => ({ 
          ...prev, 
          jobTitle: [], // Reset job title filter for events
          unlockType: undefined 
        }));
        setOpenSections(prev => ({ ...prev, jobTitle: false }));
      }
      // If no types are selected, add both back
      else if (newTypes.length === 0) {
        return ['Events', 'Contacts'];
      }
      
      return newTypes;
    });
  };

  const handleUnlockTypeChange = (type: string | undefined) => {
    setFilters(prev => {
      // Get current unlock types
      const currentTypes = prev.unlockType ? [prev.unlockType] : [];
      
      // If type is already selected, remove it
      if (currentTypes.includes(type)) {
        return {
          ...prev,
          unlockType: undefined,
          jobTitle: []
        };
      }
      
      // Add the new type
      return {
        ...prev,
        unlockType: type,
        jobTitle: type === 'Unlock Contact Email' ? prev.jobTitle : []
      };
    });

    // Update lead types based on current selection
    const currentTypes = filters.unlockType ? [filters.unlockType] : [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    setSelectedLeadTypes(
      newTypes.length === 0
        ? ['Events', 'Contacts']
        : newTypes.some(t => t === 'Unlock Contact Email')
          ? ['Contacts']
          : ['Events']
    );
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
    handleUnlockTypeChange // Export the handler
  };
}