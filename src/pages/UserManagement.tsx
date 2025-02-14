import React, { useState, useEffect } from 'react';
import { User, Loader2 } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useProfileUpdate } from '../hooks/useProfileUpdate';
import ProfileForm from '../components/profile/ProfileForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import SuccessAlert from '../components/common/SuccessAlert';

export default function UserManagement() {
  const { profile, loading, error: profileError } = useUserProfile();
  const { 
    updateProfile, 
    isSubmitting, 
    error: updateError,
    clearError 
  } = useProfileUpdate();
  const [success, setSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<'personal' | 'professional' | null>(null);
  const [formState, setFormState] = useState({
    fullName: profile?.display_name || '',
    services: profile?.services || '',  
    industries: profile?.industries || [],
    offering: profile?.offering || '',
    website: profile?.website || ''
  });

  // Update form state when profile loads
  useEffect(() => {
    if (profile) {
      setFormState({
        fullName: profile.display_name || '',
        services: profile.services || '',  
        industries: profile.industries || [],
        offering: profile.offering || '',
        website: profile.website || ''
      });
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <ErrorAlert message={profileError || 'Failed to load profile'} />
        </div>
      </div>
    );
  }

  const handleProfileSubmit = async (formData: { 
    fullName: string; 
    services: string; 
    industries: string[]; 
    offering: string;
    website: string;
  }) => {
    try {
      if (!profile?.id) {
        throw new Error('No profile ID available');
      }

      clearError();
      setSuccess(false);

      const result = await updateProfile(profile.id, {
        display_name: formData.fullName,
        services: formData.services,  
        industries: formData.industries,
        offering: formData.offering,
        website: formData.website
      });

      if (result.success) {
        setFormState(formData);
        setSuccess(true);
        setActiveSection(null);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      console.error(errorMessage);
    } finally {
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setFormState({
      fullName: profile.display_name || '',
      services: profile.services || '',  
      industries: profile.industries || [],
      offering: profile.offering || '',
      website: profile.website || ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess(false);

    try {
      await updateProfile({
        display_name: formState.fullName,
        services: formState.services,  
        offering: formState.offering || null,
        website: formState.website || null
      });
      setSuccess(true);
      setActiveSection(null);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-sm text-gray-600 mt-1">
                {profile.email}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {updateError && <ErrorAlert message={updateError} />}
          {success && <SuccessAlert message="Profile updated successfully!" />}

          <ProfileForm
            initialData={formState}
            avatarUrl={profile.avatarUrl}
            onPhotoChange={async (url) => {
              // Only trigger profile update if avatar URL actually changed
              if (url === profile.avatarUrl) return;
              
              // Update profile with current form state
              await handleProfileSubmit({
                ...formState,
                // Ensure we use latest avatar URL
                avatarUrl: url
              });
            }}
            onSubmit={handleProfileSubmit}
            isSubmitting={isSubmitting}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        </div>
      </div>
    </div>
  );
}