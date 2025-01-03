import React from 'react';
import { Users } from 'lucide-react';
import FilterSection from './FilterSection';
import MultiSelect from './MultiSelect';
import { organizationTypes } from '../../constants/filters';

interface OrganizationTypeFilterProps {
  selectedOrgTypes: string[];
  onOrgTypeSelect: (orgType: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onUnselectAll?: () => void;
  showUnselectAll?: boolean;
}

export default function OrganizationTypeFilter({
  selectedOrgTypes,
  onOrgTypeSelect,
  isOpen,
  onToggle,
  onUnselectAll,
  showUnselectAll
}: OrganizationTypeFilterProps) {
  return (
    <FilterSection
      title="Organization Type"
      icon={Users}
      isOpen={isOpen}
      onToggle={onToggle}
      onUnselectAll={onUnselectAll}
      showUnselectAll={showUnselectAll}
    >
      <MultiSelect
        options={organizationTypes}
        selected={selectedOrgTypes}
        onChange={onOrgTypeSelect}
      />
    </FilterSection>
  );
}