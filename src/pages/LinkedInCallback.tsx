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
    const handleOAuthResponse = async () => {
      console.log("Processing LinkedIn OAuth callback...");

      // Use getSessionFromUrl() to extract the OAuth tokens from the URL
      const {
        data: { session },
        error,
      } = await supabase.auth.getSessionFromUrl();

      if (error) {
        console.error('Error fetching session:', error);
        navigate('/login');
        return;
      }

      if (!session) {
        console.warn('No session found.');
        navigate('/login');
        return;
      }

      const user = session.user;
      if (!user) {
        console.warn('No user found in session.');
        navigate('/login');
        return;
      }

      // Check if a corresponding profile row exists in your "profiles" table
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && !profileError.message.includes('row not found')) {
        console.error('Profile error:', profileError);
      }

      if (!existingProfile) {
        // Brand-new user: create their profile and send them to onboarding
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          null;

        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          display_name: fullName,
        });

        if (insertError) {
          console.error('Error creating profile:', insertError);
        }

        console.log('New user detected. Redirecting to onboarding.');
        navigate('/onboarding');
      } else {
        // Existing user: send them to the dashboard.
        console.log('Existing user detected. Redirecting to dashboard.');
        navigate('/dashboard');
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
