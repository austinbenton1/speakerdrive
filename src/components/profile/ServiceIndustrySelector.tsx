import React from 'react';
import { 
  Mic2, Users, GitCommit, Presentation, Lightbulb,
  Monitor, GraduationCap, Briefcase, LineChart, School,
  Target, Heart, Store, Stethoscope, Leaf, Plus, Check
} from 'lucide-react';
import { services } from '../../utils/constants';
import { useProfile } from '../../hooks/useProfile';

interface ServiceSelectorProps {
  selectedService: string;
  disabled?: boolean;
  onServiceChange: (serviceLabel: string) => void;
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
    return value;
  };

  // Local state for selection with proper parsing
  const [localService, setLocalService] = React.useState<string>(() => {
    const initialService = parseServiceValue(selectedService || profile?.services);
    return initialService;
  });

  // Update local state when prop changes
  React.useEffect(() => {
    const newService = parseServiceValue(selectedService || profile?.services);
    setLocalService(newService);
  }, [selectedService, profile?.services]);

  const handleServiceClick = (serviceId: string) => {
    if (disabled) return;
    
    // Find the service to get its label
    const service = services.find(s => s.id === serviceId);
    if (service) {
      const newService = service.label;  // Use the full label
      setLocalService(newService);
      onServiceChange(newService);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-[15px] font-medium text-gray-900 mb-3">Primary Service Offering</h3>
      <div className="grid grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-4 text-gray-500">Loading...</div>
        ) : (
          services.map((service) => {
            const Icon = iconMap[service.icon as keyof typeof iconMap];
            const isSelected = localService === service.label;  // Compare with label directly
            
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => handleServiceClick(service.id)}
                disabled={disabled}
                className={`relative flex items-center space-x-3 rounded-lg border p-4 hover:border-gray-400 ${
                  isSelected 
                    ? 'border-blue-500 ring-1 ring-blue-500'
                    : 'border-gray-300'
                }`}
              >
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                  isSelected ? 'bg-blue-500' : 'bg-gray-100'
                }`}>
                  <Icon className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                    {service.label}
                  </p>
                </div>
                {isSelected && (
                  <div className="absolute -top-px -right-px">
                    <Check className="h-5 w-5 text-blue-500" />
                  </div>
                )}
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