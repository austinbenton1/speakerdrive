import React from 'react';
import { User } from 'lucide-react';
import Input from '../Input';
import ServiceIndustrySelector from './ServiceIndustrySelector';

interface ProfileFormData {
  fullName: string;
  services: string[];
  industries: string[];
  offering: string;
}

interface ProfileFormProps {
  initialData?: ProfileFormData;
  onSubmit: (data: ProfileFormData) => void;
  isSubmitting?: boolean;
}

export default function ProfileForm({ 
  initialData,
  onSubmit,
  isSubmitting = false 
}: ProfileFormProps) {
  const [formData, setFormData] = React.useState<ProfileFormData>({
    fullName: initialData?.fullName || '',
    services: initialData?.services || [],
    industries: initialData?.industries || [],
    offering: initialData?.offering || ''
  });

  const handleServiceChange = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const handleIndustryChange = (industryId: string) => {
    if (formData.industries.includes(industryId)) {
      setFormData(prev => ({
        ...prev,
        industries: prev.industries.filter(id => id !== industryId)
      }));
    } else if (formData.industries.length < 3) {
      setFormData(prev => ({
        ...prev,
        industries: [...prev.industries, industryId]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Full Name"
        type="text"
        value={formData.fullName}
        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
        icon={User}
        placeholder="Enter your full name"
        disabled={isSubmitting}
      />

      <ServiceIndustrySelector
        selectedServices={formData.services}
        selectedIndustries={formData.industries}
        offering={formData.offering}
        onServiceChange={handleServiceChange}
        onIndustryChange={handleIndustryChange}
        onOfferingChange={(value) => setFormData(prev => ({ ...prev, offering: value }))}
        disabled={isSubmitting}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !formData.fullName.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}