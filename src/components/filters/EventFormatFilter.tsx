import React from 'react';
import { Calendar } from 'lucide-react';
import FilterSection from './FilterSection';
import MultiSelect from './MultiSelect';
import { eventFormats } from '../../constants/filters';

interface EventFormatFilterProps {
  selectedFormats: string[];
  onFormatSelect: (format: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onUnselectAll?: () => void;
  showUnselectAll?: boolean;
}

export default function EventFormatFilter({
  selectedFormats,
  onFormatSelect,
  isOpen,
  onToggle,
  onUnselectAll,
  showUnselectAll
}: EventFormatFilterProps) {
  return (
    <FilterSection
      title="Event Format"
      icon={Calendar}
      isOpen={isOpen}
      onToggle={onToggle}
      onUnselectAll={onUnselectAll}
      showUnselectAll={showUnselectAll}
    >
      <MultiSelect
        options={eventFormats}
        selected={selectedFormats}
        onChange={onFormatSelect}
      />
    </FilterSection>
  );
}