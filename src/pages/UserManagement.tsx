import React, { useState } from 'react';
import { User, MessageSquare, Shield } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useProfileUpdate } from '../hooks/useProfileUpdate';
import ProfileForm from '../components/profile/ProfileForm';
import PhotoUploader from '../components/PhotoUploader';
import SecurityTab from '../components/settings/SecurityTab';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import SuccessAlert from '../components/common/SuccessAlert';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'support', label: 'Get Support', icon: MessageSquare },
];

export default function UserManagement() {
  const { profile, loading, error: profileError } = useUserProfile();
  const { 
    updateProfile, 
    isSubmitting, 
    error: updateError, 
    success,
    clearError 
  } = useProfileUpdate();
  const [activeTab, setActiveTab] = useState('profile');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="p-8">
        <ErrorAlert message={profileError || 'Failed to load profile'} />
      </div>
    );
  }

  const handleProfileSubmit = async (formData: { 
    fullName: string; 
    services: string[]; 
    industries: string[]; 
    offering: string;
    website: string;
  }) => {
    // Clear any existing error before submitting
    clearError();

    if (!profile.id) return;

    await updateProfile(profile.id, {
      display_name: formData.fullName,
      services: formData.services,
      industries: formData.industries,
      offering: formData.offering,
      website: formData.website
    });
  };

  return (
    <div className="min-h-full bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-center text-sm font-medium hover:bg-gray-50 focus:z-10
                    ${activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 border-b-2 border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center justify-center">
                    <tab.icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {updateError && (
                  <ErrorAlert message={updateError} />
                )}

                {success && (
                  <SuccessAlert message="Profile updated successfully!" />
                )}

                <PhotoUploader
                  avatarUrl={profile.avatarUrl}
                  onPhotoChange={(url) => {
                    handleProfileSubmit({
                      fullName: profile.display_name || '',
                      services: profile.services || [],
                      industries: profile.industries || [],
                      offering: profile.offering || '',
                      website: profile.website || ''
                    });
                  }}
                />

                <ProfileForm
                  initialData={{
                    fullName: profile.display_name || '',
                    services: Array.isArray(profile.services) ? profile.services : [],
                    industries: Array.isArray(profile.industries) ? profile.industries : [],
                    offering: profile.offering || '',
                    website: profile.website || ''
                  }}
                  onSubmit={handleProfileSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            )}

            {activeTab === 'security' && <SecurityTab />}

            {activeTab === 'support' && (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Support section coming soon
                </h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}