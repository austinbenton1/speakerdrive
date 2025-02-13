// /home/project/src/pages/LinkedInCallback.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LinkedInCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing LinkedIn authentication...');

  useEffect(() => {
    const handleOAuthResponse = async () => {
      try {
        console.log('LinkedIn callback initiated');
        console.log('Current URL:', window.location.href);
        
        // Get URL parameters
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const error = params.get('error');
        const errorDescription = params.get('error_description');
        const state = params.get('state');

        console.log('URL parameters:', {
          code: code ? 'present' : 'missing',
          error,
          errorDescription,
          state: state ? 'present' : 'missing',
          fullUrl: window.location.href
        });

        if (error || !code) {
          const errorMsg = errorDescription || error || 'Authentication failed';
          console.error('OAuth error:', { error, errorDescription });
          setStatus(`Authentication error: ${errorMsg}`);
          
          if (window.opener) {
            console.log('Sending error to parent window');
            window.opener.postMessage({ 
              type: 'linkedin-auth-error', 
              error: errorMsg
            }, window.location.origin);
            window.close();
          } else {
            navigate('/login');
          }
          return;
        }

        console.log('Exchanging code for session...');
        setStatus('Exchanging authentication code...');
        
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (exchangeError) {
          console.error('Session exchange error:', {
            message: exchangeError.message,
            status: exchangeError.status,
            name: exchangeError.name
          });
          
          setStatus(`Session exchange error: ${exchangeError.message}`);
          
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

        if (!data.session?.user) {
          const errorMsg = 'No user data in session';
          console.error(errorMsg);
          setStatus(errorMsg);
          
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'linkedin-auth-error', 
              error: errorMsg
            }, window.location.origin);
            window.close();
          } else {
            navigate('/login');
          }
          return;
        }

        console.log('Session obtained successfully');
        setStatus('Checking user profile...');

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
        setStatus(`Authentication successful. Redirecting to ${redirectPath}...`);

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
          navigate(redirectPath);
        }

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Internal error';
        console.error('Callback error:', err);
        setStatus(`An error occurred: ${errorMsg}`);
        
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'linkedin-auth-error', 
            error: errorMsg
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
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-gray-700 mb-4">{status}</p>
      <div className="text-sm text-gray-500">
        Window ID: linkedin-auth-window
      </div>
    </div>
  );
}
