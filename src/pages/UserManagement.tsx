import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MessageSquare, Mail, MessageCircle, AtSign, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Input from '../components/Input';
import ServiceSelector from '../components/onboarding/ServiceSelector';
import IndustrySelector from '../components/onboarding/IndustrySelector';
import PhotoUploader from '../components/PhotoUploader';
import SecurityTab from '../components/settings/SecurityTab';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'support', label: 'Get Support', icon: MessageSquare },
  { id: 'feedback', label: 'Give Us Feedback', icon: MessageSquare },
];

interface UserProfile {
  name: string;
  email: string;
  services: string[];
  industries: string[];
  offering: string;
  emailSignature: string;
  avatarUrl: string | null;
}

export default function UserManagement() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    services: [],
    industries: [],
    offering: '',
    emailSignature: '',
    avatarUrl: null
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
          navigate('/login');
          return;
        }
        setUser(session.user);

        // Fetch profile data for the authenticated user
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('services, industries, offering, email_signature, avatar_url')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        setProfile({
          name: session.user.user_metadata?.display_name || '',
          email: session.user.email || '',
          services: profileData?.services?.split(',') || [],
          industries: profileData?.industries?.split(',') || [],
          offering: profileData?.offering || '',
          emailSignature: profileData?.email_signature || '',
          avatarUrl: profileData?.avatar_url
        });
      } catch (err) {
        console.error('Error loading profile:', err);
        navigate('/login');
      }
    };

    loadUserProfile();
  }, [navigate]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { display_name: profile.name }
      });

      if (authError) throw authError;

      // Update profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          services: profile.services.join(','),
          industries: profile.industries.join(','),
          offering: profile.offering,
          email_signature: profile.emailSignature
        })
        .eq('id', user.id);

      if (profileError) throw profileError;
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
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
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Profile Photo */}
                <PhotoUploader
                  avatarUrl={profile.avatarUrl}
                  onPhotoChange={(url) => setProfile(prev => ({ ...prev, avatarUrl: url }))}
                />

                {/* Profile Fields */}
                <div className="space-y-6">
                  <Input
                    label="Full Name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!isEditing}
                    icon={User}
                  />

                  <Input
                    label="Email"
                    value={profile.email}
                    disabled={true}
                    icon={Mail}
                  />

                  <div className={isEditing ? '' : 'opacity-75'}>
                    <ServiceSelector
                      selectedServices={profile.services}
                      onChange={(serviceId) => {
                        if (!isEditing) return;
                        const newServices = profile.services.includes(serviceId)
                          ? profile.services.filter(id => id !== serviceId)
                          : [...profile.services, serviceId];
                        setProfile({ ...profile, services: newServices });
                      }}
                      disabled={!isEditing}
                      hideLabel={false}
                    />
                  </div>

                  <div className={isEditing ? '' : 'opacity-75'}>
                    <IndustrySelector
                      selectedIndustries={profile.industries}
                      onChange={(industryId) => {
                        if (!isEditing) return;
                        const newIndustries = profile.industries.includes(industryId)
                          ? profile.industries.filter(id => id !== industryId)
                          : [...profile.industries, industryId];
                        if (newIndustries.length <= 3) {
                          setProfile({ ...profile, industries: newIndustries });
                        }
                      }}
                      disabled={!isEditing}
                      hideLabel={false}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Offering
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MessageCircle className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        rows={4}
                        value={profile.offering}
                        onChange={(e) => setProfile({ ...profile, offering: e.target.value })}
                        disabled={!isEditing}
                        className={`
                          block w-full pl-10 pr-3 py-2 resize-none
                          border rounded-md shadow-sm
                          focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                          ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}
                          ${isEditing ? 'border-gray-300' : 'border-gray-200'}
                        `}
                        placeholder="Describe your offering..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Signature
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <AtSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        rows={4}
                        value={profile.emailSignature}
                        onChange={(e) => setProfile({ ...profile, emailSignature: e.target.value })}
                        disabled={!isEditing}
                        className={`
                          block w-full pl-10 pr-3 py-2 resize-none
                          border rounded-md shadow-sm
                          focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                          ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}
                          ${isEditing ? 'border-gray-300' : 'border-gray-200'}
                        `}
                        placeholder="Enter your email signature..."
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
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
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <SecurityTab />
            )}

            {activeTab === 'support' && (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Support section coming soon</h3>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Feedback section coming soon</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}