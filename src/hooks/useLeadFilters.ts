import { useState } from 'react';
import type { FilterOptions } from '../types';

export function useLeadFilters() {
  const [selectedLeadTypes, setSelectedLeadTypes] = useState<string[]>(['Events', 'Contacts']);
  const [selectedEventUnlockTypes, setSelectedEventUnlockTypes] = useState<string[]>(['Event Email', 'Event URL']);
  const [filters, setFilters] = useState<FilterOptions>({
    targetAudience: '',
    jobTitle: '',
    searchEvent: '',
    organization: '',
    pastSpeakers: '',
    searchAll: '',
    location: [],
    industry: [],
    timeframe: [],
    domain: [],
  });
  const [openSections, setOpenSections] = useState({
    location: false,
    industry: false,
    timeframe: false,
    domain: false,
    moreFilters: false,
  });

  const toggleLeadType = (type: string) => {
    setSelectedLeadTypes(prev => {
      if (prev.length === 1 && prev.includes(type)) {
        return prev;
      }
      return prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type];
    });
  };

  const toggleEventUnlockType = (type: string) => {
    setSelectedEventUnlockTypes(prev => {
      if (prev.length === 1 && prev.includes(type)) {
        return prev;
      }
      return prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type];
    });
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return {
    selectedLeadTypes,
    selectedEventUnlockTypes,
    filters,
    openSections,
    setFilters,
    toggleLeadType,
    toggleEventUnlockType,
    toggleSection,
  };
}