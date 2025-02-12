// /home/project/src/pages/LinkedInCallback.tsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LinkedInCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Once the user is redirected back to our site, Supabase automatically handles
    // token parsing via the URL. We just need to check the session or user object.
    const handleOAuthResponse = async () => {
      // Check if we have a valid session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching session:', error);
        // Handle error or redirect somewhere
        return;
      }

      if (!session) {
        console.warn('No session found.');
        // Possibly show an error or redirect to login
        navigate('/login');
        return;
      }

      const user = session.user;
      if (!user) {
        console.warn('No user found in session.');
        navigate('/login');
        return;
      }

      // Check if a corresponding profile row exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
      }

      // If no profile found, create one
      if (!existingProfile) {
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || null;

        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          display_name: fullName,
        });

        if (insertError) {
          console.error('Error creating profile:', insertError);
        }
      }

      // If everything is good, redirect user to the dashboard (or wherever)
      navigate('/dashboard');
    };

    handleOAuthResponse();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-700">Processing LinkedIn login...</p>
    </div>
  );
}
