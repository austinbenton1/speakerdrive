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
          {services.map((service) => (
            <label
              key={service.id}
              className={`
                relative flex items-center justify-between px-4 py-3 border rounded-lg
                transition-colors
                ${disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
                ${selectedServices.includes(service.id)
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedServices.includes(service.id)}
                  onChange={() => !disabled && onServiceChange(service.id)}
                  disabled={disabled}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{service.label}</span>
              </div>
              {selectedServices.includes(service.id) && (
                <Check className="w-4 h-4 text-blue-500" />
              )}
            </label>
          ))}
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
          {industries.map((industry) => (
            <label
              key={industry.id}
              className={`
                relative flex items-center justify-between px-4 py-3 border rounded-lg
                transition-colors
                ${disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
                ${selectedIndustries.includes(industry.id)
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }
                ${!selectedIndustries.includes(industry.id) && selectedIndustries.length >= 3
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
                }
              `}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedIndustries.includes(industry.id)}
                  onChange={() => !disabled && onIndustryChange(industry.id)}
                  disabled={disabled || (!selectedIndustries.includes(industry.id) && selectedIndustries.length >= 3)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{industry.label}</span>
              </div>
              {selectedIndustries.includes(industry.id) && (
                <Check className="w-4 h-4 text-blue-500" />
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}