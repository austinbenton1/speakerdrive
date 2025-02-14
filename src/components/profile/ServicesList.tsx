import React from 'react';
import { 
  Check, Presentation, School, Target, Briefcase, 
  Users, Plus, Monitor, GraduationCap, LineChart,
  Heart, Store, Stethoscope, Leaf
} from 'lucide-react';

interface ServicesListProps {
  selectedService: string;
  onServiceSelect?: (service: string) => void;
  disabled?: boolean;
}

export default function ServicesList({
  selectedService,
  onServiceSelect,
  disabled = false
}: ServicesListProps) {
  const services = [
    { id: 'keynote', label: 'Keynote Speaking' },
    { id: 'workshops', label: 'Workshops' },
    { id: 'coaching', label: 'Coaching' },
    { id: 'consulting', label: 'Consulting' },
    { id: 'facilitation', label: 'Facilitation' }
  ];

  return (
    <div className="space-y-2">
      {services.map((service) => (
        <div
          key={service.id}
          className={`
            flex items-center p-2 rounded cursor-pointer
            ${selectedService === service.label
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-gray-100'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={() => {
            if (!disabled && onServiceSelect) {
              onServiceSelect(service.label);
            }
          }}
        >
          <span className="ml-2">{service.label}</span>
        </div>
      ))}
    </div>
  );
}