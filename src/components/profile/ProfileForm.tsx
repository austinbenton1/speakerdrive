import React from 'react';
import { User, Check, Globe, Briefcase, Presentation, School, Target, Users, Plus, Edit2 } from 'lucide-react';
import { services } from '../../utils/constants';
import Input from '../Input';
import PhotoUploader from '../PhotoUploader';
import ServiceSelector from './ServiceIndustrySelector';
import AboutMe from './AboutMe';
import Website from './Website';

interface ProfileFormData {
  fullName: string;
  services: string[];
  industries: string[];
  offering: string;
  website: string;
  avatarUrl?: string | null;
}

interface ProfileFormProps {
  initialData?: ProfileFormData;
  avatarUrl: string | null;
  onPhotoChange: (url: string | null) => void;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isSubmitting?: boolean;
  activeSection: 'personal' | 'professional' | null;
  setActiveSection: (section: 'personal' | 'professional' | null) => void;
}

export default function ProfileForm({ 
  initialData,
  avatarUrl,
  onPhotoChange,
  onSubmit,
  isSubmitting = false,
  activeSection,
  setActiveSection
}: ProfileFormProps) {
  const [formData, setFormData] = React.useState<ProfileFormData>({
    fullName: initialData?.fullName || '',
    services: initialData?.services || [],
    industries: initialData?.industries || [],
    offering: initialData?.offering || '',
    website: initialData?.website || '',
    avatarUrl: initialData?.avatarUrl || null
  });
  
  // Reset form data when initialData changes
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || '',
        services: initialData.services || [],
        industries: initialData.industries || [],
        offering: initialData.offering || '',
        website: initialData.website || '',
        avatarUrl: initialData.avatarUrl || null
      });
    }
  }, [initialData]);

  const handleServiceChange = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services: [serviceId] 
    }));
  };

  const handleCancel = () => {
    setActiveSection(null);
    setFormData({
      fullName: initialData?.fullName || '',
      services: initialData?.services || [],
      industries: initialData?.industries || [],
      offering: initialData?.offering || '',
      website: initialData?.website || '',
      avatarUrl: initialData?.avatarUrl || null
    });
    
    setFormData({
      fullName: initialData?.fullName || '',
      services: initialData?.services || [],
      industries: initialData?.industries || [],
      offering: initialData?.offering || '',
      website: initialData?.website || '',
      avatarUrl: initialData?.avatarUrl || null
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formData.fullName.trim()) {
        throw new Error('Name is required');
      }

      // Submit form data
      await onSubmit({
        fullName: formData.fullName,
        services: formData.services,
        industries: formData.industries,
        offering: formData.offering,
        website: formData.website,
        avatarUrl: formData.avatarUrl
      });

      // Reset active section on success
      setActiveSection(null);
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const getServiceIcon = (service: string) => {
    const serviceConfig = services.find(s => s.id === service);
    const IconComponent = serviceConfig?.icon === 'Presentation' ? Presentation
      : serviceConfig?.icon === 'School' ? School
      : serviceConfig?.icon === 'Target' ? Target
      : serviceConfig?.icon === 'Briefcase' ? Briefcase
      : serviceConfig?.icon === 'Users' ? Users
      : Plus;
    
    return <IconComponent className="w-4 h-4 text-blue-500" />;
  };

  const formatServiceName = (service: string) => {
    return services.find(s => s.id === service)?.label || service;
  };

  if (!activeSection) {
    return (
      <div className="space-y-6">
        {/* Personal Information Section */}
        <div className="bg-white rounded-xl border border-gray-200/75 shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-br from-gray-50/80 via-white to-gray-50/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <User className="w-4 h-4 text-gray-400" />
                <h2 className="text-[15px] font-medium text-gray-900">Personal Information</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('personal')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-[160px_1fr] gap-10">
              {/* Photo */}
              <div className="w-[160px]">
                {avatarUrl ? (
                  <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-gray-200/75">
                    <img
                      key={avatarUrl}
                      src={avatarUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'https://www.gravatar.com/avatar/default?d=mp&s=200';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-40 h-40 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200/75">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="mt-1 text-base text-gray-900">{formData.fullName || 'Not set'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Website</h3>
                  {formData.website ? (
                    <a
                      href={formData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-base text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {formData.website.replace(/^https?:\/\//, '')}
                    </a>
                  ) : (
                    <p className="mt-1 text-base text-gray-400">Not set</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Details Section */}
        <div className="bg-white rounded-xl border border-gray-200/75 shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-br from-gray-50/80 via-white to-gray-50/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <h2 className="text-[15px] font-medium text-gray-900">Professional Details</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('professional')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Details
              </button>
            </div>
          </div>
          <div className="p-8 space-y-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Primary Service</h3>
              <div className="mt-2">
                {formData.services[0] ? (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium bg-white border border-blue-200 text-blue-700">
                    {getServiceIcon(formData.services[0])}
                    {services.find(s => s.id === formData.services[0])?.label || formatServiceName(formData.services[0])}
                  </div>
                ) : (
                  <p className="text-base text-gray-400">Not set</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Professional Bio</h3>
              <p className="mt-2 text-base text-gray-900 whitespace-pre-wrap">
                {formData.offering || 'No bio provided'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {activeSection === 'personal' && (
        <div className="bg-white rounded-xl border border-gray-200/75 shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-br from-gray-50/80 via-white to-gray-50/80">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <h2 className="text-[15px] font-medium text-gray-900">Personal Information</h2>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-[160px_1fr] gap-10">
              {/* Photo Upload */}
              <div className="w-[160px]">
                <PhotoUploader
                  avatarUrl={avatarUrl}
                  onPhotoChange={(url) => {
                    // Update local form state first
                    setFormData(prev => ({
                      ...prev,
                      avatarUrl: url
                    }));
                    // Then notify parent
                    onPhotoChange(url);
                  }}
                />
              </div>

              {/* Form Fields */}
              <div className="space-y-4 min-w-0">
                <Input
                  label="Name"
                  helperText="This is how you'll appear to others"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  icon={User}
                  placeholder="Enter your name"
                  disabled={isSubmitting}
                  showValidation
                  isValid={formData.fullName.length >= 2}
                  className="w-full"
                />
                <Website
                  value={formData.website}
                  onChange={(value) => setFormData(prev => ({ ...prev, website: value }))}
                  isEditing={true}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'professional' && (
        <div className="bg-white rounded-xl border border-gray-200/75 shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-br from-gray-50/80 via-white to-gray-50/80">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <h2 className="text-[15px] font-medium text-gray-900">Professional Details</h2>
            </div>
          </div>
          <div className="p-8 space-y-10">
            <div className="pb-10 border-b border-gray-100">
              <ServiceSelector
                selectedService={formData.services[0] || ''}
                onServiceChange={handleServiceChange}
                isEditing={true}
                disabled={isSubmitting}
              />
            </div>

            <AboutMe
              value={formData.offering}
              onChange={(value) => {
                setFormData(prev => ({ ...prev, offering: value }))
              }}
              isEditing={true}
              disabled={isSubmitting}
            />
          </div>
        </div>
      )}

      {activeSection && (
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </form>
  );
}