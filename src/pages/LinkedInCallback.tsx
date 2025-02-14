// /home/project/src/pages/LinkedInCallback.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { updateProfileWithLinkedInData } from '../services/linkedin/profileService';

export default function LinkedInCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing LinkedIn authentication...');

  useEffect(() => {
    const handleOAuthResponse = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (!session?.user) {
          await supabase.auth.signOut();
          navigate('/login');
          return;
        }

        try {
          await updateProfileWithLinkedInData(session.user);
        } catch (error) {
          console.error('Error updating profile:', error);
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('services')
          .eq('id', session.user.id)
          .single();

        if (profileError && !profileError.message.includes('row not found')) {
          console.error('Profile error:', profileError);
        }

        const urlParams = new URLSearchParams(window.location.search);
        const origin = urlParams.get('origin');

        let redirectPath = '/dashboard'; // default path
          
        if (!profile?.services) {
          redirectPath = '/onboarding';
        } else if (origin === 'signup') {
          redirectPath = '/chat/conversation';
        } else if (origin === 'login') {
          redirectPath = '/dashboard';
        }

        navigate(redirectPath);
        return;

      } catch (err) {
        console.error('Authentication error:', err);
        setStatus('An error occurred during authentication');
        navigate('/login');
      }
    };

    handleOAuthResponse();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-center mb-4">LinkedIn Authentication</h2>
        <p className="text-gray-700 text-center mb-4">{status}</p>
      </div>
    </div>
  );
}
