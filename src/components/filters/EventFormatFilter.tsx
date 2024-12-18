import React from 'react';
import FilterSection from './FilterSection';
import MultiSelect from './MultiSelect';
import { eventFormats } from '../../constants/filters';

interface EventFormatFilterProps {
  selectedFormats: string[];
  onFormatSelect: (format: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onUnselectAll: () => void;
}

export default function EventFormatFilter({
  selectedFormats,
  onFormatSelect,
  isOpen,
  onToggle,
  onUnselectAll,
}: EventFormatFilterProps) {
  return (
    <FilterSection
      title="Event Format"
      isOpen={isOpen}
      onToggle={onToggle}
      onUnselectAll={onUnselectAll}
      showUnselectAll={selectedFormats.length > 0}
    >
      <MultiSelect
        options={eventFormats}
        selected={selectedFormats}
        onChange={onFormatSelect}
      />
    </FilterSection>
  );
}
