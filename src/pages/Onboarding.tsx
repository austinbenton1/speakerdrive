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

// Retry mechanism for failed requests
async function retryRequest<T>(
  request: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await request();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
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
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.user) {
          await supabase.auth.signOut();
          navigate('/login');
          return;
        }
        setUser(session.user);
      } catch (error) {
        console.error('Error checking user:', error);
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

    let webhookSuccess = false;
    try {
      setError(null);
      setIsSubmitting(true);
      setProgress(20);

      // Function to send both webhooks
      const sendWebhooks = async (retries = 3): Promise<boolean> => {
        for (let i = 0; i < retries; i++) {
          try {
            // Send both webhooks in parallel
            const [aiResponse, onboardingResponse] = await Promise.all([
              fetch('https://n8n.speakerdrive.com/webhook/ai-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  message: 'onboarding_init',
                  email: user.email,
                  display_name: data.fullName,
                  services: data.services,
                  website: data.website || null
                })
              }),
              fetch('https://n8n.speakerdrive.com/webhook/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: user.email,
                  display_name: data.fullName,
                  services: data.services,
                  website: data.website || null
                })
              })
            ]);

            if (aiResponse.ok && onboardingResponse.ok) {
              return true;
            }

            // Wait before retrying
            if (i < retries - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
            }
          } catch (error) {
            console.error('Webhook attempt failed:', error);
            if (i === retries - 1) throw error;
          }
        }
        return false;
      };

      // Function to retry webhook
      const sendWebhook = async (retries = 3): Promise<boolean> => {
        for (let i = 0; i < retries; i++) {
          try {
            const response = await fetch('https://n8n.speakerdrive.com/webhook/ai-data', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: 'onboarding_init',
                email: user.email,
                display_name: data.fullName,
                services: data.services,
                website: data.website || null
              })
            });

            if (response.ok) {
              return true;
            }

            // Wait before retrying
            if (i < retries - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
            }
          } catch (error) {
            console.error('Webhook attempt failed:', error);
            if (i === retries - 1) throw error;
          }
        }
        return false;
      };

      // First update auth user metadata
      const { error: updateUserError } = await supabase.auth.updateUser({
        data: {
          display_name: data.fullName
        }
      });

      if (updateUserError) throw updateUserError;
      setProgress(40);

      // Then update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: data.fullName,
          services: data.services,
          website: data.website || null
        });

      if (profileError) throw profileError;
      setProgress(60);

      // Try to send webhook with retries
      webhookSuccess = await sendWebhooks();
      if (!webhookSuccess) {
        throw new Error('Failed to send onboarding webhooks after multiple attempts');
      }

      setProgress(100);

      // Navigate to chat - no URL parameters needed
      navigate('/chat/conversation');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to complete onboarding');
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