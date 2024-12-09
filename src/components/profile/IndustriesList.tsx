import React from 'react';
import { Check } from 'lucide-react';
import { industries } from '../../utils/constants';

interface IndustriesListProps {
  selectedIndustries: string[];
}

export default function IndustriesList({ selectedIndustries }: IndustriesListProps) {
  if (selectedIndustries.length === 0) {
    return <p className="text-sm text-gray-500">No industries selected</p>;
  }

  return (
    <div className="space-y-2">
      {industries.map((industry) => {
        const isSelected = selectedIndustries.includes(industry.id);
        if (!isSelected) return null;

        return (
          <div
            key={industry.id}
            className="flex items-center text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-md"
          >
            <Check className="w-4 h-4 text-blue-500 mr-2" />
            <span>{industry.label}</span>
          </div>
        );
      })}
    </div>
  );
}