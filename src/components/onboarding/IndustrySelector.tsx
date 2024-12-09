import React from 'react';
import { Building, Check } from 'lucide-react';

export const industries = [
  { id: 'leadership', label: 'Leadership & Corporate Development' },
  { id: 'education', label: 'Education & Training' },
  { id: 'business', label: 'General Business & Entrepreneurship' },
  { id: 'community', label: 'Community, Culture & Inclusion' },
  { id: 'health', label: 'Health, Wellness & Sustainability' },
  { id: 'technology', label: 'Technology & Media' },
  { id: 'finance', label: 'Finance, Business & Corporate Services' },
  { id: 'nonprofit', label: 'Nonprofit, Associations & Public Sector' },
  { id: 'sales', label: 'Sales & Consumer Services' },
  { id: 'manufacturing', label: 'Manufacturing & Industrial' },
  { id: 'other', label: 'Other' },
];

interface IndustrySelectorProps {
  selectedIndustries: string[];
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  hideLabel?: boolean;
}

export default function IndustrySelector({ selectedIndustries, onChange, error, disabled, hideLabel }: IndustrySelectorProps) {
  return (
    <div>
      {!hideLabel && (
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Industries You Target
          <span className="ml-2 text-sm font-normal text-gray-500">
            (Choose top 3)
          </span>
        </label>
      )}
      <div className="mt-2 grid grid-cols-1 gap-3">
        {industries.map((industry) => (
          <label
            key={industry.id}
            className={`
              relative flex items-center justify-between px-4 py-3 border rounded-lg
              focus:outline-none transition-colors
              ${disabled ? 'cursor-default' : 'cursor-pointer'}
              ${
                selectedIndustries.includes(industry.id)
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-700'
              }
              ${!disabled && !selectedIndustries.includes(industry.id) ? 'hover:bg-gray-50' : ''}
              ${disabled ? 'opacity-75' : ''}
              ${
                !selectedIndustries.includes(industry.id) && selectedIndustries.length >= 3 && !disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }
            `}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                value={industry.id}
                checked={selectedIndustries.includes(industry.id)}
                onChange={(e) => !disabled && onChange(e.target.value)}
                disabled={disabled || (!selectedIndustries.includes(industry.id) && selectedIndustries.length >= 3)}
                className="sr-only"
              />
              <Building
                className={`w-4 h-4 mr-2 ${
                  selectedIndustries.includes(industry.id)
                    ? 'text-blue-500'
                    : 'text-gray-400'
                }`}
              />
              <span className="text-sm font-medium">{industry.label}</span>
            </div>
            {selectedIndustries.includes(industry.id) && (
              <Check className="w-4 h-4 text-blue-500" />
            )}
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}