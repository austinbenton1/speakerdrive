// /home/project/src/pages/LinkedInCallback.tsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LinkedInCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthResponse = async () => {
      console.log('LinkedIn callback reached with URL fragment:', window.location.hash);

      // Example final URL might look like:
      // https://app.speakerdrive.com/linkedin-callback#access_token=eyJhbGciOi...
      const hash = window.location.hash; // The part after '#'
      if (!hash) {
        console.error('No hash fragment found in URL. Cannot parse LinkedIn token.');
        navigate('/login');
        return;
      }

      // Remove the leading '#' and parse the key/value pairs
      const params = new URLSearchParams(hash.slice(1));

      // LinkedIn might call this 'access_token' (often for implicit OIDC).
      // If it's labeled something else (e.g. 'id_token'), change accordingly.
      const accessToken = params.get('access_token');
      if (!accessToken) {
        console.error('No "access_token" found in hash:', hash);
        navigate('/login');
        return;
      }

      // Now we call Supabase to "exchange" this token for a session.
      // Even though Supabase calls it "code", we're actually passing the
      // access token from the implicit flow:
      const { data, error } = await supabase.auth.exchangeCodeForSession({
        code: accessToken,
        // If LinkedIn requires the same redirect URI as part of the exchange:
        // redirectUri: 'https://app.speakerdrive.com/linkedin-callback'
      });

      if (error) {
        console.error('Error exchanging token with Supabase:', error);
        navigate('/login');
        return;
      }

      if (!data.session) {
        console.error('No session returned from Supabase exchange.');
        navigate('/login');
        return;
      }

      // At this point, we have a valid Supabase session
      const user = data.session.user;
      if (!user) {
        console.warn('No user found in session.');
        navigate('/login');
        return;
      }

      // Next: check if a "profiles" row exists or not
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && !profileError.message.includes('row not found')) {
        console.error('Profile error:', profileError);
      }

      if (!existingProfile) {
        // Brand-new user => create a profile row
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

        console.log('New user. Redirecting to /onboarding.');
        navigate('/onboarding');
      } else {
        // Existing user => redirect to dashboard
        console.log('Existing user. Redirecting to /dashboard.');
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
