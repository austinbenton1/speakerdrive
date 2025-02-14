import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User as UserIcon,
  AlertCircle,
  Loader2,
  Building,
  Briefcase,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import ServiceSelector from '../components/onboarding/ServiceSelector';
import WebsiteInput from '../components/onboarding/WebsiteInput';
import {
  onboardingSchema,
  type OnboardingFormData,
} from '../types/auth';

/** Small sleep utility for retries */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sends the onboarding webhook with retries
 */
async function sendOnboardingWebhook(
  urlOnboarding: string,
  body: Record<string, unknown>,
  retries = 3,
  delay = 1000
): Promise<boolean> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(urlOnboarding, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (response.ok) return true;

      if (attempt < retries - 1) {
        await sleep(delay * Math.pow(2, attempt));
      }
    } catch (error) {
      if (attempt === retries - 1) throw error;
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

  // Step flow: 1 or 2
  const [currentStep, setCurrentStep] = useState(1);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: '',
      services: '',
      account_type: 'direct',
      company: '',
      company_role: '',
      profile_url_type: 'website', // hidden from user
      website: '',
    },
  });

  const accountType = watch('account_type'); // "direct" or "partner"
  const selectedService = watch('services');
  const websiteValue = watch('website');

  // Check if user is logged in and fetch profile
  useEffect(() => {
    let isMounted = true;

    const checkUserAndProfile = async () => {
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

        if (isMounted) {
          setUser(session.user);

          // Fetch user's profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('[Onboarding Debug] Profile fetch error:', profileError);
          } else if (profile?.display_name && isMounted) {
            setValue('fullName', profile.display_name);
          }
        }
      } catch (err) {
        console.error('[Onboarding Debug] Auth check error:', err);
        if (isMounted) {
          await supabase.auth.signOut();
          navigate('/login');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkUserAndProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate, setValue]);

  /**
   * Step 1 => "Continue"
   */
  const handleContinue = async () => {
    // Validate only fullName for step 1
    const valid = await trigger(['fullName']);
    if (valid) {
      setCurrentStep(2);
    }
  };

  /**
   * Final "Complete Setup" => step 2
   */
  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) return;

    try {
      setError(null);
      setIsSubmitting(true);
      setProgress(20);

      // 1) Update user
      const { error: updateUserError } = await supabase.auth.updateUser({
        data: { display_name: data.fullName },
      });
      if (updateUserError) throw updateUserError;
      setProgress(40);

      // 2) Upsert profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: data.fullName,
          services: data.services, // This will now be the full label (e.g., "Keynote Speaking")
          account_type: data.account_type,
          company: data.company || null,
          company_role: data.company_role || null,
          profile_url_type: data.profile_url_type,
          website: data.website || null,
        });
      if (profileError) throw profileError;
      setProgress(60);

      // 3) Webhook
      const webhookBody = {
        message: 'onboarding_init',
        email: user.email,
        display_name: data.fullName,
        services: data.services, // This will now be the full label
        account_type: data.account_type,
        company: data.company || null,
        company_role: data.company_role || null,
        profile_url_type: data.profile_url_type,
        website: data.website || null,
      };
      const onboardingOk = await sendOnboardingWebhook(
        'https://n8n.speakerdrive.com/webhook/onboarding',
        webhookBody
      );
      if (!onboardingOk) {
        throw new Error('Failed to send onboarding webhook after multiple attempts');
      }
      setProgress(100);

      // Redirect to chat/conversation instead of dashboard
      navigate('/chat/conversation');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to complete onboarding';
      console.error('[Onboarding Debug] Final submission error:', msg);
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AuthLayout title="Complete Your Profile" subtitle="Help us personalize your experience">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#00A3FF]" />
            <p className="text-sm text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    // Use "wide" so we get a max-w-xl container instead of the narrower max-w-md
    <AuthLayout
      title="Complete Your Profile"
      subtitle="Help us personalize your experience"
      wide
    >
      <div className="space-y-6">
        {error && (
          <div className="p-3 rounded-md bg-red-50 flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="space-y-8">
              {/* Full Name */}
              <section className="space-y-2 max-w-md">
                <label className="block text-sm font-medium text-gray-700">Your Name</label>
                <Input
                  label=""
                  type="text"
                  icon={UserIcon}
                  {...register('fullName')}
                  disabled={isSubmitting}
                  error={errors.fullName?.message}
                  className="
                    w-full
                    transition-shadow 
                    focus:shadow-sm 
                    focus:ring-2 
                    focus:ring-[#00A3FF]
                    focus:outline-none
                  "
                />
              </section>

              {/* Speaker vs Support => Pill style */}
              <section className="space-y-2">
                <div className="flex gap-3 mt-2 flex-wrap">
                  {/* DIRECT Pill */}
                  <button
                    type="button"
                    onClick={() => setValue('account_type', 'direct', { shouldValidate: true })}
                    className={`
                      inline-block px-5 py-3 text-sm font-medium rounded-full border transition-colors
                      ${
                        accountType === 'direct'
                          ? 'bg-[#00A3FF] text-white border-[#00A3FF]'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    I&apos;m a Speaker, Coach, or Expert
                  </button>

                  {/* PARTNER Pill */}
                  <button
                    type="button"
                    onClick={() => setValue('account_type', 'partner', { shouldValidate: true })}
                    className={`
                      inline-block px-5 py-3 text-sm font-medium rounded-full border transition-colors
                      ${
                        accountType === 'partner'
                          ? 'bg-[#00A3FF] text-white border-[#00A3FF]'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    I Support or Represent Speakers or Experts
                  </button>
                </div>
              </section>

              {/* If partner => Company & Role */}
              {accountType === 'partner' && (
                <section className="space-y-4">
                  <div className="max-w-md">
                    <Input
                      label="Company"
                      type="text"
                      icon={Building}
                      disabled={isSubmitting}
                      {...register('company')}
                      error={errors.company?.message}
                      className="
                        w-full
                        transition-shadow 
                        focus:shadow-sm 
                        focus:ring-2 
                        focus:ring-[#00A3FF]
                      "
                    />
                  </div>
                  <div className="max-w-md">
                    <Input
                      label="Company Role"
                      type="text"
                      icon={Briefcase}
                      disabled={isSubmitting}
                      {...register('company_role')}
                      error={errors.company_role?.message}
                      className="
                        w-full
                        transition-shadow 
                        focus:shadow-sm 
                        focus:ring-2 
                        focus:ring-[#00A3FF]
                      "
                    />
                  </div>
                </section>
              )}

              {/* Step 1 => Continue */}
              <div>
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={isSubmitting}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-md
                    text-white font-medium
                    transition-all duration-150
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A3FF]
                    ${
                      isSubmitting
                        ? 'bg-[#00A3FF]/70 cursor-not-allowed'
                        : 'bg-[#00A3FF] hover:bg-[#0095e6] active:scale-[0.98]'
                    }
                  `}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Primary Service */}
              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Primary Service</h3>
                <ServiceSelector
                  selectedService={selectedService}
                  onChange={(val) => setValue('services', val, { shouldValidate: true })}
                  disabled={isSubmitting}
                  error={errors.services?.message}
                />
              </section>

              {/* Website */}
              <section className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-800">Website or Profile URL</h3>
                <div className="max-w-md">
                  <WebsiteInput
                    value={websiteValue}
                    onChange={(e) => setValue('website', e.target.value, { shouldValidate: true })}
                    disabled={isSubmitting}
                    error={errors.website?.message}
                    className="w-full"
                  />
                </div>
              </section>

              {/* Final Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md
                    text-white font-medium
                    transition-all duration-150
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A3FF]
                    ${
                      isSubmitting
                        ? 'bg-[#00A3FF]/70 cursor-not-allowed'
                        : 'bg-[#00A3FF] hover:bg-[#0095e6] active:scale-[0.98]'
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
              </div>
            </div>
          )}
        </form>
      </div>
    </AuthLayout>
  );
}
