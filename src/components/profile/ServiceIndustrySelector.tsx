import React from 'react';
import { 
  Mic2, Users, GitCommit, Presentation, Lightbulb,
  Monitor, GraduationCap, Briefcase, LineChart, School,
  Target, Heart, Store, Stethoscope, Leaf, Plus
} from 'lucide-react';
import { services } from '../../utils/constants';
import { useProfile } from '../../hooks/useProfile';

interface ServiceSelectorProps {
  selectedService: string;
  disabled?: boolean;
  onServiceChange: (serviceId: string) => void;
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
  School,
  Target,
  Heart,
  Store,
  Stethoscope,
  Leaf,
  Plus
};

export default function ServiceSelector({
  selectedService,
  onServiceChange,
  disabled = false
}: ServiceSelectorProps) {
  const { profile, loading } = useProfile();

  // Local state for selection
  const [localService, setLocalService] = React.useState(selectedService || profile?.services || '');

  // Update local state when profile or props change
  React.useEffect(() => {
    // Priority: prop > profile > empty
    const newService = selectedService || profile?.services || '';
    setLocalService(newService);
  }, [selectedService, profile?.services]);

  const handleServiceClick = (serviceId: string) => {
    if (!disabled) {
      // Update local state first
      setLocalService(serviceId);
      // Then notify parent
      onServiceChange(serviceId);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-4">Primary Service Offering</h3>
      <div className="grid grid-cols-3 gap-3">
        {loading ? (
          <div className="col-span-3 text-center py-4 text-gray-500">Loading...</div>
        ) : (
          services.map((service) => {
            const isSelected = service.id === localService;
            const Icon = iconMap[service.icon as keyof typeof iconMap];
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => handleServiceClick(service.id)}
                disabled={disabled}
                className={`relative flex items-center justify-center gap-1 px-3 py-2 rounded-full text-sm font-medium
                  transition-colors duration-200
                  border
                  ${isSelected 
                    ? 'bg-blue-500 border-blue-500 text-white shadow-sm' 
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {Icon && (
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                )}
                {service.label}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}