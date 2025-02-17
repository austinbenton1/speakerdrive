import React from 'react';
import {
  Presentation,
  School,
  Target,
  Briefcase,
  Users,
  Plus,
} from 'lucide-react';
import { services } from '../../utils/constants';

interface ServiceSelectorProps {
  selectedService: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  hideLabel?: boolean;
}

// Map of icon components
const iconComponents = {
  Presentation,
  School,
  Target,
  Briefcase,
  Users,
  Plus,
};

export default function ServiceSelector({
  selectedService,
  onChange,
  error,
  disabled = false,
  hideLabel = false,
}: ServiceSelectorProps) {
  /**
   * Check if a service is "selected," including "other:..."
   */
  const isServiceSelected = (serviceId: string) => {
    if (serviceId === 'other') {
      return selectedService.startsWith('other:');
    }
    const service = services.find((s) => s.id === serviceId);
    return service?.label === selectedService;
  };

  const handleServiceClick = (serviceId: string) => {
    if (disabled) return;
    // If user clicks "Other", store "other:" to signal custom text
    if (serviceId === 'other') {
      onChange('other:');
      return;
    }
    // Otherwise, find the matching label
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      onChange(service.label);
    }
  };

  const handleCustomServiceChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (disabled) return;
    onChange(`other:${e.target.value}`);
  };

  // Extract the custom text after "other:"
  const otherValue = selectedService.startsWith('other:')
    ? selectedService.substring(6)
    : '';

  return (
    <div>
      {!hideLabel && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Choose your main focus. You can change this later.
          </label>
        </div>
      )}

      {/* Pill buttons for standard services */}
      <div className="flex flex-wrap gap-2">
        {services.map((service) => {
          const Icon = iconComponents[service.icon as keyof typeof iconComponents];
          const selected = isServiceSelected(service.id);

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => handleServiceClick(service.id)}
              disabled={disabled}
              className={`
                inline-flex items-center rounded-full border
                px-4 py-2 text-sm font-medium
                focus:outline-none transition-colors
                ${
                  selected
                    ? 'bg-[#2864ec] text-white border-[#2864ec]'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }
                ${disabled ? 'cursor-not-allowed opacity-50' : ''}
              `}
            >
              {Icon && (
                <Icon
                  className={`w-4 h-4 mr-2 ${
                    selected ? 'text-white' : 'text-gray-400'
                  }`}
                />
              )}
              {service.label}
            </button>
          );
        })}
      </div>

      {/* Custom service input if "Other" is selected */}
      {isServiceSelected('other') && (
        <div className="max-w-md mt-3">
          <input
            type="text"
            value={otherValue}
            onChange={handleCustomServiceChange}
            disabled={disabled}
            maxLength={20}
            className={`
              block w-full 
              pl-4 pr-4 py-2
              border rounded-lg bg-white
              border-gray-200 hover:border-gray-300 
              focus:border-[#2864ec] focus:ring-[#2864ec]/10 focus:ring-2
              placeholder:text-gray-400
              focus:outline-none focus:ring-opacity-20
              focus:bg-gray-50/75
              disabled:bg-gray-50/75 disabled:text-gray-500
              text-[15px]
            `}
            placeholder="Enter your custom service"
            aria-label="Custom service"
          />
          <p className="text-xs text-gray-500 mt-1">
            {otherValue.length}/20
          </p>
        </div>
      )}

      {/* Validation error */}
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
