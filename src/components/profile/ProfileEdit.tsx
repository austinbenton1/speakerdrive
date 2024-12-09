import React, { useState } from 'react';
import { User, Mail } from 'lucide-react';
import EditableField from './EditableField';
import EditableServicesList from './EditableServicesList';
import EditableIndustriesList from './EditableIndustriesList';
import ProfileSection from './ProfileSection';
import { validateName } from '../../utils/validation';
import { supabase } from '../../lib/supabase';

interface Profile {
  display_name: string;
  email: string;
  services: string[];
  industries: string[];
  transformation?: string;
  email_signature?: string;
  avatar_url?: string;
}

export default function ProfileEdit() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleNameUpdate = async (name: string) => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: name }
      });
      if (error) throw error;
      setProfile(prev => prev ? { ...prev, display_name: name } : null);
    } catch (error) {
      console.error('Error updating name:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleServicesUpdate = async (services: string[]) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ services: services.join(',') })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, services } : null);
    } catch (error) {
      console.error('Error updating services:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleIndustriesUpdate = async (industries: string[]) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ industries: industries.join(',') })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, industries } : null);
    } catch (error) {
      console.error('Error updating industries:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

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
        <div className="flex-1">
          <EditableField
            label="Display Name"
            value={profile.display_name}
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

      <ProfileSection title="Services" isEditing>
        <EditableServicesList
          selectedServices={profile.services}
          onSave={handleServicesUpdate}
          onCancel={() => {}}
        />
      </ProfileSection>

      <ProfileSection title="Industries" isEditing>
        <EditableIndustriesList
          selectedIndustries={profile.industries}
          onSave={handleIndustriesUpdate}
          onCancel={() => {}}
        />
      </ProfileSection>
    </div>
  );
}