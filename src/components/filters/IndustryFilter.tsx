import React from 'react';
import { Building2 } from 'lucide-react';
import FilterSection from './FilterSection';
import MultiSelect from './MultiSelect';
import { industries } from '../../constants/filters';

interface IndustryFilterProps {
  selectedIndustries: string[];
  onIndustrySelect: (industry: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onUnselectAll?: () => void;
  showUnselectAll?: boolean;
}

export default function IndustryFilter({
  selectedIndustries,
  onIndustrySelect,
  isOpen,
  onToggle,
  onUnselectAll,
  showUnselectAll
}: IndustryFilterProps) {
  return (
    <FilterSection
      title="Industry Category"
      icon={Building2}
      isOpen={isOpen}
      onToggle={onToggle}
      onUnselectAll={onUnselectAll}
      showUnselectAll={showUnselectAll}
    >
      <MultiSelect
        options={industries}
        selected={selectedIndustries}
        onChange={onIndustrySelect}
      />
    </FilterSection>
  );
}