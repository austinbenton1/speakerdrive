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

// Helper for delayed retries
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to send both webhooks with retries
async function sendWebhooks(
  urlAI: string,
  urlOnboarding: string,
  body: object,
  retries = 3,
  delay = 1000
): Promise<boolean> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log('[Webhook Debug] Attempt:', attempt + 1);

      const [aiResponse, onboardingResponse] = await Promise.all([
        fetch(urlAI, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
        fetch(urlOnboarding, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
      ]);

      console.log('[Webhook Debug] AI Response:', {
        status: aiResponse.status,
        ok: aiResponse.ok,
      });
      console.log('[Webhook Debug] Onboarding Response:', {
        status: onboardingResponse.status,
        ok: onboardingResponse.ok,
      });

      if (aiResponse.ok && onboardingResponse.ok) {
        return true;
      }

      // If either failed, wait before retrying
      if (attempt < retries - 1) {
        console.log('[Webhook Debug] One or both webhooks failed. Retrying...');
        await sleep(delay * Math.pow(2, attempt)); // Exponential backoff
      }
    } catch (error) {
      console.error('[Webhook Debug] Error during webhook calls:', error);
      if (attempt === retries - 1) {
        throw error;
      }
      // Wait before retrying
      await sleep(delay * Math.pow(2, attempt));
    }
  }
  return false;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.user) {
          await supabase.auth.signOut();
          navigate('/login');
          return;
        }
        setUser(session.user);
      } catch (err) {
        console.error('Error checking user:', err);
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
    setValue('services', value, { shouldValidate: true });
  };

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) return;

    try {
      setError(null);
      setIsSubmitting(true);
      setProgress(20);

      // 1) Update user metadata
      const { error: updateUserError } = await supabase.auth.updateUser({
        data: {
          display_name: data.fullName,
        },
      });
      if (updateUserError) throw updateUserError;
      setProgress(40);

      // 2) Update profile table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: data.fullName,
          services: data.services,
          website: data.website || null,
        });
      if (profileError) throw profileError;
      setProgress(60);

      // 3) Fire off webhooks (one for ai-data, one for onboarding)
      const webhookBody = {
        message: 'onboarding_init',
        email: user.email,
        display_name: data.fullName,
        services: data.services,
        website: data.website || null,
      };

      const webhookSuccess = await sendWebhooks(
        'https://n8n.speakerdrive.com/webhook/ai-data',
        'https://n8n.speakerdrive.com/webhook/onboarding',
        webhookBody
      );

      if (!webhookSuccess) {
        throw new Error('Failed to send onboarding webhooks after multiple attempts');
      }

      setProgress(100);

      // 4) Navigate to chat with onboarding parameters
      navigate('/chat/conversation?source=onboarding&trigger=auto');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
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
