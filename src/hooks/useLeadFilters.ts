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
      const currentTypes = prev.unlockType || [];
      const isSelected = currentTypes.includes(type);

      // If already selected, remove it
      if (isSelected) {
        return {
          ...prev,
          unlockType: currentTypes.filter(t => t !== type)
        };
      }

      // Add new selection
      return {
        ...prev,
        unlockType: [...currentTypes, type]
      };
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