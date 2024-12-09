import React from 'react';
import { supabase } from '../lib/supabase';

export default function ProfileTest() {
  const [profile, setProfile] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleTestUpdate = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('profiles')
        .update({
          services: ['keynote', 'workshop'],
          industries: ['technology', 'finance']
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => ({
        ...prev,
        services: ['keynote', 'workshop'],
        industries: ['technology', 'finance']
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-8 space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-bold">Current Profile Data:</h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {JSON.stringify(profile, null, 2)}
        </pre>
      </div>

      <button
        onClick={handleTestUpdate}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Test Update Profile
      </button>
    </div>
  );
}