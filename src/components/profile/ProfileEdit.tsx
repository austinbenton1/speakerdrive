import React from 'react';
import { User, Mail } from 'lucide-react';
import EditableField from './EditableField';
import { validateName } from '../../utils/validation';
import { useProfileUpdate } from '../../hooks/useProfileUpdate';
import { useProfile } from '../../hooks/useProfile';

export default function ProfileEdit() {
  const { profile, loading, error: profileError } = useProfile();
  const { updateProfile, isUpdating, error: updateError } = useProfileUpdate();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">{profileError || 'Failed to load profile data'}</p>
      </div>
    );
  }

  const handleNameUpdate = async (name: string) => {
    if (!profile.id) return;
    await updateProfile(profile.id, { name });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.display_name || profile.email}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="h-8 w-8 text-gray-400" />
          </div>
        )}
        <div className="flex-1">
          <EditableField
            label="Display Name"
            value={profile.display_name || ''}
            onChange={handleNameUpdate}
            onSave={async () => {}}
            onCancel={() => {}}
            validate={validateName}
          />
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Mail className="w-4 h-4 mr-1.5" />
            {profile.email}
          </div>
        </div>
      </div>

      {updateError && (
        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md">
          {updateError}
        </div>
      )}
    </div>
  );
}