// /home/project/src/pages/LinkedInCallback.tsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LinkedInCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthResponse = async () => {
      try {
        // Get the current URL's hash or search params
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        if (error || !code) {
          console.error('OAuth error:', error, errorDescription);
          if (window.opener) {
            window.opener.postMessage({ type: 'linkedin-auth-error', error: errorDescription }, window.location.origin);
            window.close();
          } else {
            navigate('/login');
          }
          return;
        }

        // Exchange the code for a session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error('Error exchanging code:', exchangeError);
          if (window.opener) {
            window.opener.postMessage({ type: 'linkedin-auth-error', error: exchangeError.message }, window.location.origin);
            window.close();
          } else {
            navigate('/login');
          }
          return;
        }

        if (!data.session?.user) {
          console.error('No user in session');
          if (window.opener) {
            window.opener.postMessage({ type: 'linkedin-auth-error', error: 'No user in session' }, window.location.origin);
            window.close();
          } else {
            navigate('/login');
          }
          return;
        }

        // Check if profile exists
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        if (profileError && !profileError.message.includes('row not found')) {
          console.error('Profile error:', profileError);
        }

        // Determine redirect path
        const redirectPath = !existingProfile ? '/onboarding' : '/dashboard';

        if (window.opener) {
          // If in popup, send success message to parent
          window.opener.postMessage(
            { 
              type: 'linkedin-auth-success',
              redirectPath
            },
            window.location.origin
          );
          window.close();
        } else {
          // If not in popup, redirect directly
          navigate(redirectPath);
        }

      } catch (err) {
        console.error('Callback error:', err);
        if (window.opener) {
          window.opener.postMessage({ type: 'linkedin-auth-error', error: 'Internal error' }, window.location.origin);
          window.close();
        } else {
          navigate('/login');
        }
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
