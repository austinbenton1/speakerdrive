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
        console.log('LinkedIn callback initiated');

        // Get the current session to check if we're already authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session check error:', sessionError);
          setStatus('Error checking session status');
          navigate('/login');
          return;
        }

        if (session?.user) {
          console.log('User is authenticated:', {
            id: session.user.id,
            email: session.user.email
          });

          try {
            // Update profile with LinkedIn data from user metadata
            await updateProfileWithLinkedInData(session.user);
          } catch (error) {
            console.error('Error updating profile with LinkedIn data:', error);
          }

          // Check if profile exists
          const { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError && !profileError.message.includes('row not found')) {
            console.error('Profile error:', profileError);
          }

          const redirectPath = !existingProfile ? '/onboarding' : '/dashboard';
          console.log('Redirecting to:', redirectPath);
          navigate(redirectPath);
          return;
        }

        // If we get here, something went wrong with the authentication
        console.error('No session found after authentication');
        setStatus('Authentication failed - No session found');
        navigate('/login');

      } catch (err) {
        console.error('Callback error:', err);
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
