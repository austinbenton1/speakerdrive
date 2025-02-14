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
   * Determine if a given service is "selected," including the case
   * where a user has typed "other:Some Custom Text."
   */
  const isServiceSelected = (serviceId: string) => {
    // For 'other' option
    if (serviceId === 'other') {
      return selectedService.startsWith('other:');
    }
    
    // For regular services, compare with the full label
    const service = services.find(s => s.id === serviceId);
    return service?.label === selectedService;
  };

  const handleServiceClick = (serviceId: string) => {
    if (disabled) return;
    
    // Find the service to get its label
    const service = services.find(s => s.id === serviceId);
    if (service) {
      onChange(service.label);  // Pass the label (e.g., "Keynote Speaking") instead of the id
    }
  };

  const handleCustomServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onChange(`other:${e.target.value}`);
  };

  /**
   * If the user has selected "other" and typed a custom value,
   * extract just the custom text to show in the input.
   */
  const otherValue = selectedService.startsWith('other:')
    ? selectedService.substring(6)
    : '';

  return (
    <div>
      {/* Label Section */}
      {!hideLabel && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Primary Service: Choose your main focus. You can change this later.
          </label>
        </div>
      )}

      {/* Pill-style buttons */}
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
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }
                ${disabled ? 'cursor-not-allowed opacity-50' : ''}
              `}
            >
              {Icon && (
                <Icon
                  className={`w-4 h-4 mr-2 ${
                    selected ? 'text-blue-500' : 'text-gray-400'
                  }`}
                />
              )}
              {service.label}
            </button>
          );
        })}
      </div>

      {/* Custom service input */}
      {isServiceSelected('other') && (
        <div className="mt-3">
          <input
            type="text"
            value={otherValue}
            onChange={handleCustomServiceChange}
            disabled={disabled}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter custom service"
            aria-label="Custom service"
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
