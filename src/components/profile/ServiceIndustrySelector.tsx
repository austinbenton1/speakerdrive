import React from 'react';
import { 
  Check, Mic2, Users, GitCommit, Presentation, Lightbulb,
  Monitor, GraduationCap, Briefcase, LineChart, Users2,
  Target, Heart, Store, Stethoscope, Leaf 
} from 'lucide-react';
import { services, industries } from '../../utils/constants';

interface ServiceIndustrySelectorProps {
  selectedServices: string[];
  selectedIndustries: string[];
  offering: string;
  onServiceChange: (serviceId: string) => void;
  onIndustryChange: (industryId: string) => void;
  onOfferingChange: (value: string) => void;
  disabled?: boolean;
}

const iconMap = {
  Mic2,
  Users,
  GitCommit,
  Presentation,
  Lightbulb,
  Monitor,
  GraduationCap,
  Briefcase,
  LineChart,
  Users2,
  Target,
  Heart,
  Store,
  Stethoscope,
  Leaf
};

export default function ServiceIndustrySelector({
  selectedServices,
  selectedIndustries,
  offering,
  onServiceChange,
  onIndustryChange,
  onOfferingChange,
  disabled = false
}: ServiceIndustrySelectorProps) {
  return (
    <div className="space-y-8">
      {/* Services Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Services You Provide</h3>
        <div className="grid grid-cols-3 gap-3">
          {services.map((service) => {
            const isSelected = selectedServices.includes(service.id);
            return (
              <label
                key={service.id}
                className={`
                  relative flex items-center justify-between px-3 py-2 border rounded-lg
                  transition-colors min-h-[44px]
                  ${disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
                  ${isSelected
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => !disabled && onServiceChange(service.id)}
                    disabled={disabled}
                    className="sr-only"
                  />
                  {React.createElement(iconMap[service.icon as keyof typeof iconMap], {
                    className: 'w-4 h-4 text-gray-500',
                    'aria-hidden': true
                  })}
                  <span className="text-sm font-medium truncate">{service.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-blue-500 flex-shrink-0 ml-2" />
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
        <div className="grid grid-cols-3 gap-3">
          {industries.map((industry) => {
            const isSelected = selectedIndustries.includes(industry.id);
            const isDisabled = disabled || (!isSelected && selectedIndustries.length >= 3);
            return (
              <label
                key={industry.id}
                className={`
                  relative flex items-center justify-between px-3 py-2 border rounded-lg
                  transition-colors min-h-[44px]
                  ${disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
                  ${isSelected
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => !isDisabled && onIndustryChange(industry.id)}
                    disabled={isDisabled}
                    className="sr-only"
                  />
                  {React.createElement(iconMap[industry.icon as keyof typeof iconMap], {
                    className: 'w-3.5 h-3.5 text-gray-500',
                    'aria-hidden': true
                  })}
                  <span className="text-xs font-medium truncate leading-tight">{industry.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-blue-500 flex-shrink-0 ml-2" />
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Offering Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Offering
          <span className="ml-2 text-sm font-normal text-gray-500">
            (Brief description of your services)
          </span>
        </h3>
        <textarea
          value={offering}
          onChange={(e) => onOfferingChange(e.target.value)}
          disabled={disabled}
          placeholder="Describe your services and expertise..."
          className={`
            w-full min-h-[120px] p-3 border rounded-lg
            placeholder:text-gray-400
            ${disabled ? 'cursor-not-allowed opacity-75' : ''}
            ${
              disabled
                ? 'bg-gray-50'
                : 'bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }
          `}
        />
      </div>
    </div>
  );
}