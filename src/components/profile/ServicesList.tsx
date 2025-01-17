import React from 'react';
import { 
  Check, Presentation, School, Target, Briefcase, 
  Users, Plus, Monitor, GraduationCap, LineChart,
  Heart, Store, Stethoscope, Leaf
} from 'lucide-react';
import { getAvailableServices } from '../../utils/profile';

const iconMap = {
  Presentation,
  School,
  Target,
  Briefcase,
  Users,
  Plus,
  Monitor,
  GraduationCap,
  LineChart,
  Heart,
  Store,
  Stethoscope,
  Leaf
};

interface ServicesListProps {
  selectedServices: string[];
  onChange: (serviceId: string) => void;
  disabled?: boolean;
}

export default function ServicesList({ selectedServices, onChange, disabled }: ServicesListProps) {
  const availableServices = getAvailableServices(selectedServices);

  return (
    <div className="space-y-2">
      {availableServices.map((service) => {
        const Icon = iconMap[service.icon as keyof typeof iconMap];
        return (
          <button
            key={service.id}
            onClick={() => !disabled && onChange(service.id)}
            disabled={disabled}
            className={`
              w-full flex items-center justify-between px-4 py-3 border rounded-lg
              transition-colors
              ${disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
              ${service.isSelected
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-center">
              <Icon className={`w-5 h-5 mr-3 ${
                service.isSelected ? 'text-blue-500' : 'text-gray-400'
              }`} />
              <span className="text-sm font-medium">{service.label}</span>
            </div>
            {service.isSelected && <Check className="w-4 h-4 text-blue-500" />}
          </button>
        );
      })}
    </div>
  );
}