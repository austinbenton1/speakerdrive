import React, { useEffect } from 'react';
import Input from '../Input';
import ServicesList from './ServicesList';
import IndustriesList from './IndustriesList';
import type { UserProfile } from '../../types/profile';

interface UserProfileFormProps {
  profile: UserProfile;
  isEditing: boolean;
  onProfileChange: (updates: Partial<UserProfile>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function UserProfileForm({ 
  profile, 
  isEditing, 
  onProfileChange, 
  onSubmit 
}: UserProfileFormProps) {
  const [formValues, setFormValues] = React.useState({
    display_name: profile.display_name || '',
    email: profile.email,
    services: profile.services || [],
    industries: profile.industries || []
  });

  // Update form values when profile changes
  useEffect(() => {
    setFormValues({
      display_name: profile.display_name || '',
      email: profile.email,
      services: profile.services || [],
      industries: profile.industries || []
    });
  }, [profile]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues(prev => ({
      ...prev,
      display_name: e.target.value
    }));
  };

  const handleServiceChange = (serviceId: string) => {
    setFormValues(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const handleIndustryChange = (industryId: string) => {
    setFormValues(prev => ({
      ...prev,
      industries: prev.industries.includes(industryId)
        ? prev.industries.filter(id => id !== industryId)
        : [...prev.industries, industryId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProfileChange({
      display_name: formValues.display_name,
      services: formValues.services,
      industries: formValues.industries
    });
    onSubmit(e);
  };

  const handleCancel = () => {
    setFormValues({
      display_name: profile.display_name || '',
      email: profile.email,
      services: profile.services || [],
      industries: profile.industries || []
    });
    onProfileChange({ isEditing: false });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="fullName"
        name="fullName"
        label="Full Name"
        type="text"
        value={formValues.display_name}
        onChange={handleNameChange}
        disabled={!isEditing}
        placeholder="Enter your full name"
      />

      <Input
        id="email"
        name="email"
        label="Email"
        type="email"
        value={formValues.email}
        disabled={true}
      />

      <div className={isEditing ? '' : 'opacity-75'}>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Services You Provide</h3>
        <ServicesList
          selectedServices={formValues.services}
          onChange={handleServiceChange}
          disabled={!isEditing}
        />
      </div>

      <div className={isEditing ? '' : 'opacity-75'}>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Industries You Target</h3>
        <IndustriesList
          selectedIndustries={formValues.industries}
          onChange={handleIndustryChange}
          disabled={!isEditing}
        />
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      )}
    </form>
  );
}