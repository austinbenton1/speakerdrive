import React from 'react';
import { Mic2, BookOpen, GraduationCap, Brain, Users2, HelpCircle, Check } from 'lucide-react';

export const services = [
  { id: 'keynote', label: 'Keynote Speaking', icon: Mic2 },
  { id: 'workshops', label: 'Workshops', icon: BookOpen },
  { id: 'coaching', label: 'Coaching', icon: GraduationCap },
  { id: 'consulting', label: 'Consulting', icon: Brain },
  { id: 'facilitation', label: 'Facilitation', icon: Users2 },
  { id: 'other', label: 'Other', icon: HelpCircle },
];

interface ServiceSelectorProps {
  selectedServices: string;
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
            (Select one)
          </span>
        </label>
      )}
      <div className="space-y-2">
        {services.map((service) => {
          const isSelected = selectedServices === service.id;
          return (
            <button
              key={service.id}
              onClick={() => !disabled && onChange(service.id)}
              disabled={disabled}
              className={`
                w-full flex items-center justify-between px-4 py-3 border rounded-full
                transition-colors
                ${disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
                ${isSelected
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center">
                {React.createElement(service.icon, {
                  className: `w-5 h-5 mr-3 ${
                    isSelected ? 'text-blue-500' : 'text-gray-400'
                  }`,
                })}
                <span className="text-sm font-medium">{service.label}</span>
              </div>
              {isSelected && <Check className="w-4 h-4 text-blue-500" />}
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