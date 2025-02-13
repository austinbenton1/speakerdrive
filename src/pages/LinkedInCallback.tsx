// /home/project/src/pages/LinkedInCallback.tsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LinkedInCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthResponse = async () => {
      console.log('LinkedIn callback initiated');
      try {
        // Get the current URL's hash or search params
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        console.log('URL parameters:', {
          code: code ? 'present' : 'missing',
          error,
          errorDescription,
          fullUrl: window.location.href
        });

        if (error || !code) {
          console.error('OAuth error:', error, errorDescription);
          if (window.opener) {
            console.log('Sending error to parent window');
            window.opener.postMessage({ 
              type: 'linkedin-auth-error', 
              error: errorDescription || 'Authentication failed' 
            }, window.location.origin);
            window.close();
          } else {
            navigate('/login');
          }
          return;
        }

        console.log('Exchanging code for session...');
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (exchangeError) {
          console.error('Session exchange error:', exchangeError);
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'linkedin-auth-error', 
              error: exchangeError.message 
            }, window.location.origin);
            window.close();
          } else {
            navigate('/login');
          }
          return;
        }

        console.log('Session obtained:', data.session ? 'yes' : 'no');

        if (!data.session?.user) {
          console.error('No user in session');
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'linkedin-auth-error', 
              error: 'No user in session' 
            }, window.location.origin);
            window.close();
          } else {
            navigate('/login');
          }
          return;
        }

        console.log('Checking for existing profile...');
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        if (profileError && !profileError.message.includes('row not found')) {
          console.error('Profile error:', profileError);
        }

        const redirectPath = !existingProfile ? '/onboarding' : '/dashboard';
        console.log('Determined redirect path:', redirectPath);

        if (window.opener) {
          console.log('Sending success message to parent window');
          window.opener.postMessage(
            { 
              type: 'linkedin-auth-success',
              redirectPath
            },
            window.location.origin
          );
          window.close();
        } else {
          console.log('No opener found, redirecting directly');
          navigate(redirectPath);
        }

      } catch (err) {
        console.error('Callback error:', err);
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'linkedin-auth-error', 
            error: 'Internal error' 
          }, window.location.origin);
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
