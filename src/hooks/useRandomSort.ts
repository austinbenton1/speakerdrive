import { useEffect, useRef } from 'react';
import { useProfileData } from './profile/useProfileData';
import { supabase } from '../lib/supabase';

// Valid sort fields that exist in the leads table
const VALID_SORT_FIELDS = [
  'event_name',
  'organization',
  'lead_name',
  'event_format',
  'industry'
] as const;

// Default sort if none exists
const DEFAULT_SORT = {
  field: 'event_name' as const,
  ascending: true
};

// Weights for each field (higher = more likely to be selected)
const FIELD_WEIGHTS = {
  event_name: 1,
  organization: 1,
  industry: 1,
  lead_name: 1,
  event_format: 1
} as const;

type SortField = typeof VALID_SORT_FIELDS[number];

interface SortConfig {
  field: SortField;
  ascending: boolean;
}

// Weighted random selection
function getWeightedRandomField(): SortField {
  const totalWeight = Object.values(FIELD_WEIGHTS).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (const field of VALID_SORT_FIELDS) {
    const weight = FIELD_WEIGHTS[field];
    if (random < weight) return field;
    random -= weight;
  }
  
  return DEFAULT_SORT.field;
}

function parseSortConfig(sortConfig: any): sortConfig is SortConfig {
  if (!sortConfig) return false;
  
  // If it's a string (from Supabase), try to parse it
  if (typeof sortConfig === 'string') {
    try {
      sortConfig = JSON.parse(sortConfig);
    } catch {
      return false;
    }
  }

  return typeof sortConfig === 'object' &&
         'field' in sortConfig &&
         'ascending' in sortConfig &&
         typeof sortConfig.field === 'string' &&
         VALID_SORT_FIELDS.includes(sortConfig.field as any) &&
         typeof sortConfig.ascending === 'boolean';
}

export function useRandomSort() {
  const { profile } = useProfileData();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    const checkAndUpdateSort = async () => {
      if (!profile || hasCheckedRef.current) return;
      hasCheckedRef.current = true;

      const now = new Date();
      
      // Check if we have all required valid data
      const hasValidSort = parseSortConfig(profile.random_lead_sort);
      const hasValidDate = profile.random_lead_sort_date && 
                          new Date(profile.random_lead_sort_date.replace('Z', '+00:00')).toISOString().slice(0, 13) === now.toISOString().slice(0, 13);

      // If everything is valid, keep existing sort
      if (hasValidSort && hasValidDate) {
        return;
      }

      const newSort: SortConfig = {
        field: getWeightedRandomField(),
        ascending: Math.random() < 0.5
      };

      // Update directly with supabase to avoid any potential race conditions
      const { error } = await supabase
        .from('profiles')
        .update({
          random_lead_sort: newSort,
          random_lead_sort_date: now.toISOString().replace('Z', '+00:00')
        })
        .eq('id', profile.id);

      if (error) {
        console.error('Error updating sort:', error);
      }
    };

    checkAndUpdateSort();
  }, [profile]);

  // Return the sort config, defaulting to DEFAULT_SORT if invalid
  const currentSort = profile?.random_lead_sort;
  const isValidSort = parseSortConfig(currentSort);

  return { 
    sortConfig: isValidSort ? 
      (typeof currentSort === 'string' ? JSON.parse(currentSort) : currentSort) 
      : DEFAULT_SORT
  };
}
