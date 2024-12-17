import React from 'react';
import { Check } from 'lucide-react';
import { getAvailableIndustries } from '../../utils/profile';

interface IndustriesListProps {
  selectedIndustries: string[];
  onChange: (industryId: string) => void;
  disabled?: boolean;
}

export default function IndustriesList({ selectedIndustries, onChange, disabled }: IndustriesListProps) {
  const availableIndustries = getAvailableIndustries(selectedIndustries);

  return (
    <div className="space-y-2">
      {availableIndustries.map((industry) => (
        <button
          key={industry.id}
          onClick={() => !disabled && onChange(industry.id)}
          disabled={disabled || (!industry.isSelected && selectedIndustries.length >= 3)}
          className={`
            w-full flex items-center justify-between px-4 py-3 border rounded-lg
            transition-colors
            ${disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
            ${industry.isSelected
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }
            ${!industry.isSelected && selectedIndustries.length >= 3
              ? 'opacity-50 cursor-not-allowed'
              : ''
            }
          `}
        >
          <span className="text-sm font-medium">{industry.label}</span>
          {industry.isSelected && <Check className="w-4 h-4 text-blue-500" />}
        </button>
      ))}
    </div>
  );
}