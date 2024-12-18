import React from 'react';
import FilterSection from './FilterSection';
import MultiSelect from './MultiSelect';
import { organizationTypes } from '../../constants/filters';

interface OrganizationTypeFilterProps {
  selectedOrgTypes: string[];
  onOrgTypeSelect: (orgType: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onUnselectAll: () => void;
}

export default function OrganizationTypeFilter({
  selectedOrgTypes,
  onOrgTypeSelect,
  isOpen,
  onToggle,
  onUnselectAll,
}: OrganizationTypeFilterProps) {
  return (
    <FilterSection
      title="Organization Type"
      isOpen={isOpen}
      onToggle={onToggle}
      onUnselectAll={onUnselectAll}
      showUnselectAll={selectedOrgTypes.length > 0}
    >
      <MultiSelect
        options={organizationTypes}
        selected={selectedOrgTypes}
        onChange={onOrgTypeSelect}
      />
    </FilterSection>
  );
}
