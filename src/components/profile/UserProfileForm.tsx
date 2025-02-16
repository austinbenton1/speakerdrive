import React, { useState, useEffect } from 'react';
import Input from '../Input';
import ServiceSelector from './ServiceIndustrySelector';
import type { UserProfile } from '../../types/profile';

interface UserProfileFormProps {
  profile: UserProfile;
  isEditing: boolean;
  onProfileChange: (updates: Partial<UserProfile>) => void;
  onSubmit: (values: Partial<UserProfile>) => void;
}

export default function UserProfileForm({ 
  profile, 
  isEditing, 
  onProfileChange, 
  onSubmit 
}: UserProfileFormProps) {
  console.log('UserProfileForm - Initial profile:', profile);

  // Local state for form values
  const [formValues, setFormValues] = useState({
    display_name: profile.display_name || '',
    email: profile.email,
    services: profile.services || ''
  });

  console.log('UserProfileForm - Initial formValues:', formValues);

  // Update form values when profile changes
  useEffect(() => {
    console.log('UserProfileForm - Profile changed:', profile);
    setFormValues({
      display_name: profile.display_name || '',
      email: profile.email,
      services: profile.services || ''
    });
  }, [profile]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues(prev => ({
      ...prev,
      display_name: e.target.value
    }));
  };

  const handleServiceChange = (serviceLabel: string) => {
    console.log('UserProfileForm - Service changed to:', serviceLabel);
    setFormValues(prev => ({
      ...prev,
      services: serviceLabel
    }));
    
    // Notify parent of changes
    onProfileChange({
      services: serviceLabel
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('UserProfileForm - Submitting values:', formValues);
    onSubmit({
      display_name: formValues.display_name,
      services: formValues.services
    });
  };

  const handleCancel = () => {
    // Reset form to original values
    setFormValues({
      display_name: profile.display_name || '',
      email: profile.email,
      services: profile.services || ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="max-w-[320px]">
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
      </div>

      <div className="max-w-[320px]">
        <Input
          id="email"
          name="email"
          label="Email"
          type="email"
          value={formValues.email}
          disabled={true}
        />
      </div>

      <div className={`${isEditing ? '' : 'opacity-75'} mt-8`}>
        <ServiceSelector
          selectedService={formValues.services}
          onServiceChange={handleServiceChange}
          disabled={!isEditing}
        />
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-3 mt-8">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      )}
    </form>
  );
}