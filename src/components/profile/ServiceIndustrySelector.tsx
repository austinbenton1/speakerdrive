import React from 'react';
import { Check } from 'lucide-react';
import { services, industries } from '../../utils/constants';

interface ServiceIndustrySelectorProps {
  selectedServices: string[];
  selectedIndustries: string[];
  onServiceChange: (serviceId: string) => void;
  onIndustryChange: (industryId: string) => void;
  disabled?: boolean;
}

export default function ServiceIndustrySelector({
  selectedServices,
  selectedIndustries,
  onServiceChange,
  onIndustryChange,
  disabled = false
}: ServiceIndustrySelectorProps) {
  return (
    <div className="space-y-8">
      {/* Services Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Services You Provide</h3>
        <div className="space-y-2">
          {services.map((service) => {
            const isSelected = selectedServices.includes(service.id);
            return (
              <label
                key={service.id}
                className={`
                  relative flex items-center justify-between px-4 py-3 border rounded-lg
                  transition-colors
                  ${disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
                  ${isSelected
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => !disabled && onServiceChange(service.id)}
                    disabled={disabled}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{service.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-blue-500" />
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Industries Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Industries You Target
          <span className="ml-2 text-sm font-normal text-gray-500">
            (Choose up to 3)
          </span>
        </h3>
        <div className="space-y-2">
          {industries.map((industry) => {
            const isSelected = selectedIndustries.includes(industry.id);
            const isDisabled = disabled || (!isSelected && selectedIndustries.length >= 3);
            return (
              <label
                key={industry.id}
                className={`
                  relative flex items-center justify-between px-4 py-3 border rounded-lg
                  transition-colors
                  ${disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
                  ${isSelected
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => !isDisabled && onIndustryChange(industry.id)}
                    disabled={isDisabled}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{industry.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-blue-500" />
                )}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}