import React from 'react';
import { 
  Presentation, School, Target, Briefcase, 
  Users, Plus 
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
  Plus
};

export default function ServiceSelector({ 
  selectedService, 
  onChange, 
  error, 
  disabled = false,
  hideLabel = false
}: ServiceSelectorProps) {
  const handleServiceClick = (serviceId: string) => {
    if (!disabled) {
      onChange(serviceId);
    }
  };

  return (
    <div>
      {!hideLabel && (
        <div className="space-y-1 mb-3">
          <label className="text-[15px] font-medium text-gray-900">
            Primary Service
          </label>
          <p className="text-[13px] text-gray-500">
            Choose your main focus
          </p>
        </div>
      )}
      <div className="space-y-2">
        {services.map((service) => {
          const isSelected = selectedService === service.id;
          const Icon = iconComponents[service.icon as keyof typeof iconComponents];
          
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => handleServiceClick(service.id)}
              disabled={disabled}
              className={`
                w-full flex items-center justify-between px-4 py-3 border rounded-lg
                transition-colors
                ${disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
                ${isSelected
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center">
                {Icon && (
                  <Icon className={`w-5 h-5 mr-3 ${
                    isSelected ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                )}
                <span className="text-sm font-medium">{service.label}</span>
              </div>
              {isSelected && (
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}