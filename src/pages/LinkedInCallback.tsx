// /home/project/src/pages/LinkedInCallback.tsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LinkedInCallback() {
  const navigate = useNavigate();

  useEffect(() => {
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

    handleOAuthResponse();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-700">Processing LinkedIn login...</p>
    </div>
  );
}
