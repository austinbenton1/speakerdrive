// /home/project/src/pages/LinkedInCallback.tsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LinkedInCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the access token from the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');

        if (!accessToken) {
          console.error('No access token found in URL');
          navigate('/login');
          return;
        }

        console.log('Found access token, setting session...');

        // Set the session using the access token
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: null
        });

        if (error) {
          console.error('Error setting session:', error);
          navigate('/login');
          return;
        }

        if (!data.session) {
          console.error('No session data returned');
          navigate('/login');
          return;
        }

        console.log('Session established, redirecting...');
        navigate('/chat/conversation', { replace: true });
      } catch (error) {
        console.error('Error in callback:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Completing Sign In</h2>
          <p className="text-gray-600">Please wait while we finish setting up your session...</p>
        </div>
      </div>
    </div>
  );
}
