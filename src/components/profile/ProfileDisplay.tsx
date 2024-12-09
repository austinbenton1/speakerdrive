import React from 'react';
import { User, Mail, Check } from 'lucide-react';
import { services, industries } from '../../utils/constants';
import ProfileSection from './ProfileSection';
import { supabase } from '../../lib/supabase';

export default function ProfileDisplay() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<{
    display_name: string;
    email: string;
    services: string[];
    industries: string[];
    transformation?: string;
    email_signature?: string;
    avatar_url?: string;
  } | null>(null);

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
          .select('services, industries, transformation, email_signature')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        setProfile({
          display_name: session.user.user_metadata?.display_name || '',
          email: session.user.email || '',
          services: profileData?.services?.split(',') || [],
          industries: profileData?.industries?.split(',') || [],
          transformation: profileData?.transformation,
          email_signature: profileData?.email_signature,
          avatar_url: session.user.user_metadata?.avatar_url
        });
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">{error || 'Failed to load profile data'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.display_name}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="h-8 w-8 text-gray-400" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-900">{profile.display_name}</h2>
          <div className="flex items-center text-sm text-gray-500">
            <Mail className="w-4 h-4 mr-1.5" />
            {profile.email}
          </div>
        </div>
      </div>

      <ProfileSection title="Services">
        <div className="space-y-2">
          {profile.services?.length > 0 ? (
            profile.services.map((serviceId) => {
              const service = services.find(s => s.id === serviceId);
              if (!service) return null;
              return (
                <div
                  key={serviceId}
                  className="flex items-center text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-md"
                >
                  <Check className="w-4 h-4 text-blue-500 mr-2" />
                  <span>{service.label}</span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500">No services selected</p>
          )}
        </div>
      </ProfileSection>

      <ProfileSection title="Industries">
        <div className="space-y-2">
          {profile.industries?.length > 0 ? (
            profile.industries.map((industryId) => {
              const industry = industries.find(i => i.id === industryId);
              if (!industry) return null;
              return (
                <div
                  key={industryId}
                  className="flex items-center text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-md"
                >
                  <Check className="w-4 h-4 text-blue-500 mr-2" />
                  <span>{industry.label}</span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500">No industries selected</p>
          )}
        </div>
      </ProfileSection>
    </div>
  );
}