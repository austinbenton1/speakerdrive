import { useState } from 'react';

export type SortDirection = 'asc' | 'desc' | null;
export type SortField = 'lead_name' | 'focus' | 'lead_type' | 'unlock_type' | 'industry' | 'location' | 'domain_type' | 'organization' | 'event_info' | 'event_name';

export function useTableSort() {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return {
    sortField,
    sortDirection,
    toggleSort
  };
}