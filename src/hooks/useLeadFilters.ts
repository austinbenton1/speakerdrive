import { useState } from 'react';
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
    unlockType: [], // Initialize as empty array
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
    unlockType: true,
    region: false
  });

  const toggleLeadType = (type: string) => {
    console.log('[useLeadFilters] toggleLeadType:', type);
    setSelectedLeadTypes(prev => {
      const newTypes = prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type];
      
      console.log('[useLeadFilters] New lead types:', newTypes);
      
      // Update filters based on new lead types
      setFilters(prev => {
        let newUnlockTypes: string[] = [];
        
        // If only Contacts is selected
        if (newTypes.length === 1 && newTypes[0] === 'Contacts') {
          newUnlockTypes = ['Unlock Contact Email'];
        }
        // If only Events is selected
        else if (newTypes.length === 1 && newTypes[0] === 'Events') {
          newUnlockTypes = ['Unlock Event Email', 'Unlock Event URL'];
        }
        // If both or none are selected, clear unlock types
        else {
          newUnlockTypes = [];
        }

        const newFilters = {
          ...prev,
          unlockType: newUnlockTypes,
          jobTitle: newUnlockTypes.includes('Unlock Contact Email') ? prev.jobTitle : []
        };
        
        console.log('[useLeadFilters] Updated filters:', newFilters);
        return newFilters;
      });

      // If no types are selected, add both back
      if (newTypes.length === 0) {
        return ['Events', 'Contacts'];
      }
      
      return newTypes;
    });
  };

  const handleUnlockTypeChange = (type: string) => {
    console.log('[useLeadFilters] handleUnlockTypeChange:', type);
    
    setFilters(prev => {
      const currentTypes = prev.unlockType;
      const isSelected = currentTypes.includes(type);
      
      console.log('[useLeadFilters] Current unlock types:', currentTypes);
      console.log('[useLeadFilters] Is type selected:', isSelected);
      
      // If type is already selected, remove it
      if (isSelected) {
        const newTypes: string[] = [];  // Clear all types when deselecting
        console.log('[useLeadFilters] Removing type, new types:', newTypes);
        return {
          ...prev,
          unlockType: newTypes,
          jobTitle: []  // Clear job title when clearing unlock type
        };
      }
      
      // If selecting a new type
      const newFilters = {
        ...prev,
        unlockType: [type], // Single selection - replace array with new type
        jobTitle: type === 'Unlock Contact Email' ? prev.jobTitle : []
      };
      console.log('[useLeadFilters] Adding type, new filters:', newFilters);
      return newFilters;
    });

    // Update lead types based on selection
    if (type === 'Unlock Contact Email') {
      setSelectedLeadTypes(['Contacts']);
    } else if (type === 'Unlock Event Email' || type === 'Unlock Event URL') {
      setSelectedLeadTypes(['Events']);
    } else {
      setSelectedLeadTypes(['Events', 'Contacts']);
    }
  };

  const toggleEventUnlockType = (type: string) => {
    console.log('[useLeadFilters] toggleEventUnlockType:', type);
    setSelectedEventUnlockTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      }
      return [...prev, type];
    });
  };

  const toggleSection = (section: keyof OpenSections) => {
    console.log('[useLeadFilters] toggleSection:', section);
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
    handleUnlockTypeChange
  };
}