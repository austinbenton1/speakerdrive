import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    // The session will be automatically handled by Supabase's detectSessionInUrl
    console.log('Callback page reached, waiting for session...');

    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error checking session:', error);
        navigate('/login');
        return;
      }

      if (session) {
        console.log('Session established:', session.user?.email);
        const destination = localStorage.getItem('auth_redirect') || '/chat/conversation';
        localStorage.removeItem('auth_redirect');
        navigate(destination, { replace: true });
      } else {
        console.log('No session found, redirecting to login');
        navigate('/login');
      }
    };

    // Give Supabase a moment to process the URL parameters
    setTimeout(checkSession, 100);
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
