import { useState } from 'react';
import type { FilterOptions, OpenSections } from '../types';

export function useLeadFilters() {
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
    selectedEventUnlockTypes,
    filters,
    openSections,
    setFilters,
    setOpenSections,
    toggleEventUnlockType,
    toggleSection,
    handleUnlockTypeChange
  };
}