import { useState, useEffect } from 'react';
import type { UserProfile } from '../../types/profile';

interface FormValues {
  display_name: string;
  email: string;
  services: string[];
  industries: string[];
}

export function useProfileForm(profile: UserProfile) {
  const [formValues, setFormValues] = useState<FormValues>({
    display_name: profile.display_name || '',
    email: profile.email,
    services: Array.isArray(profile.services) ? profile.services : [],
    industries: Array.isArray(profile.industries) ? profile.industries : []
  });

  // Update form values when profile changes
  useEffect(() => {
    setFormValues({
      display_name: profile.display_name || '',
      email: profile.email,
      services: Array.isArray(profile.services) ? profile.services : [],
      industries: Array.isArray(profile.industries) ? profile.industries : []
    });
  }, [profile]);

  const handleIndustryChange = (industryId: string) => {
    const currentIndustries = Array.isArray(formValues.industries) ? formValues.industries : [];
    const newIndustries = currentIndustries.includes(industryId)
      ? currentIndustries.filter(id => id !== industryId)
      : [...currentIndustries, industryId];

    setFormValues(prev => ({
      ...prev,
      industries: newIndustries
    }));
  };

  const handleServiceChange = (serviceId: string) => {
    const currentServices = Array.isArray(formValues.services) ? formValues.services : [];
    const newServices = currentServices.includes(serviceId)
      ? currentServices.filter(id => id !== serviceId)
      : [...currentServices, serviceId];

    setFormValues(prev => ({
      ...prev,
      services: newServices
    }));
  };

  const resetForm = () => {
    setFormValues({
      display_name: profile.display_name || '',
      email: profile.email,
      services: Array.isArray(profile.services) ? profile.services : [],
      industries: Array.isArray(profile.industries) ? profile.industries : []
    });
  };

  return {
    formValues,
    setFormValues,
    handleIndustryChange,
    handleServiceChange,
    resetForm
  };
}