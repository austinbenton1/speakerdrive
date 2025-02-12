import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User as UserIcon, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import ServiceSelector from '../components/onboarding/ServiceSelector';
import WebsiteInput from '../components/onboarding/WebsiteInput';
import { onboardingSchema, type OnboardingFormData } from '../types/auth';

/** Simple sleep utility for exponential backoff */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * sendOnboardingWebhook
 * Fires only the `/webhook/onboarding` endpoint with retries.
 */
async function sendOnboardingWebhook(
  urlOnboarding: string,
  body: Record<string, unknown>,
  retries = 3,
  delay = 1000
): Promise<boolean> {
  for (let attempt = 0; attempt < retries; attempt++) {
    console.log(`[Onboarding Debug] Sending onboarding webhook - Attempt #${attempt + 1}`);
    try {
      const response = await fetch(urlOnboarding, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        console.log('[Onboarding Debug] Onboarding webhook succeeded!');
        return true;
      }

      console.log('[Onboarding Debug] Onboarding webhook failed. Response status:', response.status);

      if (attempt < retries - 1) {
        console.log('[Onboarding Debug] Retrying in exponential backoff...');
        await sleep(delay * Math.pow(2, attempt));
      }
    } catch (error) {
      console.error('[Onboarding Debug] Error sending onboarding webhook:', error);
      if (attempt === retries - 1) throw error;
      await sleep(delay * Math.pow(2, attempt));
    }
  }

  console.log('[Onboarding Debug] Onboarding webhook did not succeed within max retries.');
  return false;
}

export default function Onboarding() {
  console.log('[Onboarding Debug] Component mounted...');
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    console.log('[Onboarding Debug] useEffect => Checking if user is logged in...');
    const checkUser = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.user) {
          console.log('[Onboarding Debug] No user session found, redirecting to /login');
          await supabase.auth.signOut();
          navigate('/login');
          return;
        }
        console.log('[Onboarding Debug] User session found:', session.user);
        setUser(session.user);
      } catch (err) {
        console.error('[Onboarding Debug] Error checking user:', err);
        await supabase.auth.signOut();
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: '',
      services: '',
      website: '',
    },
  });

  const selectedService = watch('services', '');
  const website = watch('website', '');

  const handleServiceChange = (value: string) => {
    console.log('[Onboarding Debug] Service changed =>', value);
    setValue('services', value, { shouldValidate: true });
  };

  /**
   * Handle form submission
   */
  const onSubmit = async (data: OnboardingFormData) => {
    console.log('[Onboarding Debug] onSubmit fired => Data:', data);
    if (!user) {
      console.log('[Onboarding Debug] No user found. Aborting.');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      setProgress(20);

      console.log('[Onboarding Debug] Updating user metadata in Supabase...');
      const { error: updateUserError } = await supabase.auth.updateUser({
        data: {
          display_name: data.fullName,
        },
      });
      if (updateUserError) {
        console.error('[Onboarding Debug] Failed to update user metadata:', updateUserError);
        throw updateUserError;
      }
      setProgress(40);

      console.log('[Onboarding Debug] Upserting user profile in Supabase...');
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: data.fullName,
          services: data.services,
          website: data.website || null,
        });
      if (profileError) {
        console.error('[Onboarding Debug] Failed to upsert profile:', profileError);
        throw profileError;
      }
      setProgress(60);

      // Fire only the /webhook/onboarding endpoint here
      const webhookBody = {
        message: 'onboarding_init',
        email: user.email,
        display_name: data.fullName,
        services: data.services,
        website: data.website || null,
      };

      console.log('[Onboarding Debug] Sending ONLY onboarding webhook...');
      const onboardingOk = await sendOnboardingWebhook(
        'https://n8n.speakerdrive.com/webhook/onboarding',
        webhookBody
      );
      if (!onboardingOk) {
        throw new Error('Failed to send onboarding webhook after multiple attempts');
      }

      setProgress(100);
      console.log('[Onboarding Debug] Onboarding webhook succeeded, navigating to /chat...');

      // 4) Navigate to chat with onboarding parameters
      navigate('/chat/conversation?source=onboarding&trigger=auto');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to complete onboarding';
      console.error('[Onboarding Debug] Error during onboarding:', msg);
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AuthLayout
        title="Complete Your Profile"
        subtitle="Help us personalize your experience"
      >
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Complete Your Profile"
      subtitle="Help us personalize your experience"
    >
      <div className="max-w-lg mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div>
            <Input
              label="Full Name"
              type="text"
              {...register('fullName')}
              error={errors.fullName?.message}
              disabled={isSubmitting}
              icon={UserIcon}
            />
          </div>

          <div>
            <ServiceSelector
              selectedService={selectedService}
              onChange={handleServiceChange}
              error={errors.services?.message}
              disabled={isSubmitting}
            />
          </div>

          <WebsiteInput
            value={website}
            onChange={(e) => setValue('website', e.target.value, { shouldValidate: true })}
            error={errors.website?.message}
            disabled={isSubmitting}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg
              text-white font-medium transition-colors
              ${isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Setting Up... {progress}%
              </>
            ) : (
              <>
                <UserIcon className="w-5 h-5" />
                Complete Setup
              </>
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
