import { useEffect, useRef } from 'react';
import { useProfileData } from './profile/useProfileData';
import { supabase } from '../lib/supabase';

// Valid sort fields that exist in the leads table
const VALID_SORT_FIELDS = [
  'id',
  'image_url',
  'focus',
  'keywords',
  'unlock_value',
  'subtext'
] as const;

// Weights for each field (higher = more likely to be selected)
const FIELD_WEIGHTS = {
  id: 1,
  image_url: 1,
  focus: 1,
  keywords: 1,
  unlock_value: 1,
  subtext: 1
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
  
  return VALID_SORT_FIELDS[0];
}

// Generate a new random sort configuration
function generateRandomSort(): SortConfig {
  return {
    field: getWeightedRandomField(),
    ascending: Math.random() < 0.5
  };
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

      // Update directly with supabase to avoid any potential race conditions
      const { error } = await supabase
        .from('profiles')
        .update({
          random_lead_sort: generateRandomSort(),
          random_lead_sort_date: now.toISOString().replace('Z', '+00:00')
        })
        .eq('id', profile.id);

      if (error) {
        console.error('Error updating sort:', error);
      }
    };

    checkAndUpdateSort();
  }, [profile]);

  // Return the current sort config or generate a new one
  const currentSort = profile?.random_lead_sort;
  const isValidSort = parseSortConfig(currentSort);

  return { 
    sortConfig: isValidSort ? 
      (typeof currentSort === 'string' ? JSON.parse(currentSort) : currentSort) 
      : generateRandomSort()
  };
}
