import React from 'react';
import { User, Mail, Check, Plus } from 'lucide-react';
import { services } from '../../utils/constants';
import ProfileSection from './ProfileSection';
import { supabase } from '../../lib/supabase';
import type { UserProfile } from '../../types/profile';

interface ProfileDisplayProps {
  onEdit?: () => void;
}

// Helper function to get service ID from label
const getServiceId = (label: string): string => {
  const service = services.find(s => s.label === label);
  return service?.id || '';
};

// Helper function to get service label from ID
const getServiceLabel = (id: string): string => {
  const service = services.find(s => s.id === id);
  return service?.label || id;
};

export default function ProfileDisplay({ onEdit }: ProfileDisplayProps) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.user) {
          setError('No authenticated user');
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        // Debug log the raw data
        console.log('Raw profile data:', profileData);

        const mappedProfile: UserProfile = {
          id: session.user.id,
          name: session.user.user_metadata?.name || null,
          display_name: session.user.user_metadata?.display_name || null,
          email: session.user.email,
          services: profileData?.services || null,  // Changed from '' to null
          avatarUrl: session.user.user_metadata?.avatar_url || null,
          quick_start_guide_tip: profileData?.quick_start_guide_tip || null,
          offering: profileData?.offering || null,
          random_lead_sort: profileData?.random_lead_sort || null,
          random_lead_sort_date: profileData?.random_lead_sort_date || null,
          website: profileData?.website || null,
        };

        // Debug log the mapped profile
        console.log('Mapped profile:', mappedProfile);

        setProfile(mappedProfile);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  React.useEffect(() => {
    console.log('Profile state in render:', {
      profile,
      services: profile?.services,
      type: profile ? typeof profile.services : 'no profile'
    });
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">No profile data available</div>
      </div>
    );
  }

  // Debug log before render
  console.log('Before render:', {
    hasProfile: !!profile,
    services: profile.services,
    type: typeof profile.services
  });

  return (
    <div className="space-y-6">
      <ProfileSection title="Basic Information">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-500" />
            <span>{profile.display_name || 'Not set'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span>{profile.email}</span>
          </div>
        </div>
      </ProfileSection>

      <ProfileSection title="Professional Details">
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700">Primary Service</h4>
            {profile.services ? (
              <div className="mt-2 flex items-center">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                  {profile.services}
                </span>
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  onClick={() => onEdit?.()}
                >
                  <Plus className="h-4 w-4 text-gray-400" />
                  Add Service
                </button>
              </div>
            )}
          </div>

          {profile.offering && (
            <div>
              <h4 className="text-sm font-medium text-gray-700">Professional Bio</h4>
              <p className="mt-2 text-sm text-gray-600">{profile.offering}</p>
            </div>
          )}
        </div>
      </ProfileSection>
    </div>
  );
}