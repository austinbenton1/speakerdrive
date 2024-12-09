import React from 'react';
import { Briefcase, Check } from 'lucide-react';

export const services = [
  { id: 'keynote', label: 'Keynote Speaker' },
  { id: 'workshop', label: 'Workshop Leader' },
  { id: 'moderator', label: 'Panel Moderator' },
  { id: 'facilitator', label: 'Facilitator' },
  { id: 'coach', label: 'Coach/Consultant' },
];

interface ServiceSelectorProps {
  selectedServices: string[];
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  hideLabel?: boolean;
}

export default function ServiceSelector({ selectedServices, onChange, error, disabled, hideLabel }: ServiceSelectorProps) {
  return (
    <div>
      {!hideLabel && (
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Services You Provide
          <span className="ml-2 text-sm font-normal text-gray-500">
            (Select all that apply)
          </span>
        </label>
      )}
      <div className="mt-2 grid grid-cols-1 gap-3">
        {services.map((service) => (
          <label
            key={service.id}
            className={`
              relative flex items-center justify-between px-4 py-3 border rounded-lg
              focus:outline-none transition-colors
              ${disabled ? 'cursor-default' : 'cursor-pointer'}
              ${
                selectedServices.includes(service.id)
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-700'
              }
              ${!disabled && !selectedServices.includes(service.id) ? 'hover:bg-gray-50' : ''}
              ${disabled ? 'opacity-75' : ''}
            `}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                value={service.id}
                checked={selectedServices.includes(service.id)}
                onChange={(e) => !disabled && onChange(e.target.value)}
                disabled={disabled}
                className="sr-only"
              />
              <Briefcase
                className={`w-4 h-4 mr-2 ${
                  selectedServices.includes(service.id)
                    ? 'text-blue-500'
                    : 'text-gray-400'
                }`}
              />
              <span className="text-sm font-medium">{service.label}</span>
            </div>
            {selectedServices.includes(service.id) && (
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