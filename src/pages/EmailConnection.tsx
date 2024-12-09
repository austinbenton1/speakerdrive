import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight, MailCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function EmailConnection() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      if (!user) return;

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          await supabase.auth.signOut();
          navigate('/login');
          return;
        }
      } catch (error) {
        console.error('Error checking user:', error);
        await supabase.auth.signOut();
        navigate('/login');
      }
    };

    checkUser();
  }, [user, navigate]);

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSkip = async () => {
    try {
      setError(null);
      setIsProcessing(true);

      // Update user metadata with email setup status
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          email_setup_completed: true,
          email_setup_skipped: true
        }
      });

      if (updateError) {
        setError('Failed to update profile. Please try again.');
        return;
      }

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error skipping email setup:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailConnect = async (provider: 'gmail' | 'outlook') => {
    try {
      setError(null);
      setIsProcessing(true);

      // Update user metadata with email setup status and provider
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          email_setup_completed: true,
          email_setup_skipped: false,
          email_provider: provider
        }
      });

      if (updateError) {
        setError('Failed to update profile. Please try again.');
        return;
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error connecting email:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <MailCheck className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Final Step: Connect Your Email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connect your email to streamline your outreach efforts
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    Error Connecting Email
                  </h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => handleEmailConnect('gmail')}
              disabled={isProcessing}
              className="w-full flex items-center justify-center px-4 py-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
                alt="Gmail"
                className="h-6 w-6 mr-3"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                Connect Gmail Account
              </span>
              <ArrowRight className="ml-3 h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            </button>

            <button
              onClick={() => handleEmailConnect('outlook')}
              disabled={isProcessing}
              className="w-full flex items-center justify-center px-4 py-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg"
                alt="Outlook"
                className="h-6 w-6 mr-3"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                Connect Outlook Account
              </span>
              <ArrowRight className="ml-3 h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button
              onClick={handleSkip}
              disabled={isProcessing}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Skip for now
            </button>
          </div>

          <div className="mt-6">
            <p className="text-xs text-center text-gray-500">
              You'll be taken to the SpeakerDrive dashboard after this step
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}