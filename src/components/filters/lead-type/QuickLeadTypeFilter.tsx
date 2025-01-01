import React from 'react';
import LeadTypeButton from './LeadTypeButton';
import { leadTypes, type LeadType } from './leadTypeConfig';

interface QuickLeadTypeFilterProps {
  selectedType: LeadType;
  onTypeChange: (type: LeadType) => void;
}

export default function QuickLeadTypeFilter({ 
  selectedType, 
  onTypeChange 
}: QuickLeadTypeFilterProps) {
  return (
    <div className="bg-gray-200/70 rounded-xl p-3 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]">
      <div className="grid grid-cols-4 gap-2">
        {leadTypes.map((type) => (
          <LeadTypeButton
            key={type.id}
            {...type}
            isSelected={selectedType === type.id}
            onClick={() => onTypeChange(type.id)}
          />
        ))}
      </div>
    </div>
  );
}