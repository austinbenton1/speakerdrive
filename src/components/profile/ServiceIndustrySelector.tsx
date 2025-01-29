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

  // Parse service value from array or string
  const parseServiceValue = (value: any): string => {
    if (!value) return '';
    if (Array.isArray(value)) return value[0] || '';
    return value;
  };

  // Local state for selection with proper parsing
  const [localService, setLocalService] = React.useState<string>(() => {
    const initialService = parseServiceValue(selectedService || profile?.services);
    return initialService;
  });

  // Update local state when profile or props change
  React.useEffect(() => {
    const newService = parseServiceValue(selectedService || profile?.services);
    setLocalService(newService);
  }, [selectedService, profile?.services]);

  const handleServiceClick = (serviceId: string) => {
    if (!disabled) {
      setLocalService(serviceId);
      onServiceChange(serviceId);
    }
  };

  return (
    <div>
      <h3 className="text-[15px] font-medium text-gray-900 mb-3">Primary Service Offering</h3>
      <div className="flex flex-wrap gap-2">
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
                className={`
                  group relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium
                  transition-all duration-200
                  border
                  ${isSelected 
                    ? 'bg-white border-blue-500 text-blue-700 shadow-sm' 
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {Icon && (
                  <Icon className={`
                    w-4 h-4 flex-shrink-0
                    ${isSelected 
                      ? 'text-blue-600' 
                      : 'text-gray-400 group-hover:text-gray-500'
                    }
                  `} />
                )}
                <span>{service.label}</span>
              </button>
            );
          })
        )}
      </div>
      <p className="mt-3 text-[13px] text-gray-500">
        This will help us tailor your experience and recommendations
      </p>
    </div>
  );
}