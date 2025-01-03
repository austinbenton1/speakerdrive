import React from 'react';
import { MapPin } from 'lucide-react';
import FilterSection from './FilterSection';
import MultiSelect from './MultiSelect';
import { locations } from '../../constants/filters';

interface LocationFilterProps {
  selectedLocations: string[];
  onLocationSelect: (location: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function LocationFilter({
  selectedLocations,
  onLocationSelect,
  isOpen,
  onToggle
}: LocationFilterProps) {
  const handleUnselectAll = () => {
    selectedLocations.forEach(location => onLocationSelect(location));
  };

  return (
    <FilterSection
      title="Location"
      icon={MapPin}
      isOpen={isOpen}
      onToggle={onToggle}
      onUnselectAll={selectedLocations.length > 0 ? handleUnselectAll : undefined}
      showUnselectAll={selectedLocations.length > 0}
    >
      <MultiSelect
        options={locations}
        selected={selectedLocations}
        onChange={onLocationSelect}
      />
    </FilterSection>
  );
}