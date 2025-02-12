// /home/project/src/pages/LinkedInCallback.tsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LinkedInCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthResponse = async () => {
      // Get the current session from Supabase (which parses tokens from the URL)
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching session:', error);
        // Redirect or show error as needed
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

      // Check if this user already has a profile in the "profiles" table
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // If there's a real DB error (other than "row not found")
      if (profileError && !profileError.message.includes('row not found')) {
        console.error('Profile error:', profileError);
      }

      if (!existingProfile) {
        // This is a brand-new user; create a row in "profiles"
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

        // Redirect brand-new user to onboarding
        navigate('/onboarding');
      } else {
        // Existing user – send to dashboard
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
