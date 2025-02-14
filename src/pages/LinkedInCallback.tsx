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
        console.log('🔄 Starting LinkedIn OAuth callback process...');
        
        // Get the current session to check if we're already authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session check error:', {
            error: sessionError,
            message: sessionError.message,
            status: sessionError.status
          });
          setStatus('Error checking session status');
          navigate('/login');
          return;
        }

        if (session?.user) {
          console.log('✅ User authenticated successfully:', {
            id: session.user.id,
            email: session.user.email,
            metadata: session.user.user_metadata
          });

          try {
            console.log('🔄 Updating profile with LinkedIn data...');
            // Update profile with LinkedIn data from user metadata
            await updateProfileWithLinkedInData(session.user);
            console.log('✅ LinkedIn profile data updated successfully');
          } catch (error) {
            console.error('❌ Error updating profile with LinkedIn data:', {
              error,
              userId: session.user.id
            });
          }

          // Check if profile has services set up
          console.log('🔄 Checking user profile services...');
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('services')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('❌ Profile query error:', {
              error: profileError,
              message: profileError.message,
              userId: session.user.id
            });
          }

          // Get the origin from URL parameters
          const urlParams = new URLSearchParams(window.location.search);
          const origin = urlParams.get('origin');
          console.log('📍 Origin parameter:', { origin });

          // Determine redirect path based on origin and profile services
          let redirectPath = '/dashboard'; // default path
          
          if (!profile?.services) {
            console.log('ℹ️ No services found, redirecting to onboarding', {
              userId: session.user.id,
              hasProfile: !!profile,
              services: profile?.services
            });
            redirectPath = '/onboarding';
          } else if (origin === 'signup') {
            console.log('ℹ️ Signup flow detected, redirecting to conversation', {
              userId: session.user.id,
              services: profile.services
            });
            redirectPath = '/chat/conversation';
          } else if (origin === 'login') {
            console.log('ℹ️ Login flow detected, redirecting to dashboard', {
              userId: session.user.id,
              services: profile.services
            });
            redirectPath = '/dashboard';
          }

          console.log('✅ LinkedIn verification complete. Redirecting to:', {
            redirectPath,
            origin,
            hasServices: !!profile?.services,
            userId: session.user.id
          });
          navigate(redirectPath);
          return;
        }

        // If we get here, something went wrong with the authentication
        console.error('❌ Authentication failed - No session found');
        setStatus('Authentication failed - No session found');
        navigate('/login');

      } catch (err) {
        console.error('❌ Callback error:', {
          error: err,
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined
        });
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
