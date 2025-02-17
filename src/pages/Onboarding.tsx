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
  Mic,
  Users,
  CheckSquare,
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
} from '../lib/auth';

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Single top-level error message
  const [stepError, setStepError] = useState<string | null>(null);

  /**
   * Onboarding has 4 states:
   * 1) Speaker vs. Partner
   * 2) Partner => Company & Role
   * 3) Partner => "See SpeakerDrive in Action..."
   * 4) Everyone => Name, Primary Service, Website
   */
  const [currentStep, setCurrentStep] = useState(1);

  // Step 3 checkbox
  const [acknowledge, setAcknowledge] = useState(false);
  // If the user chooses "Other" role
  const [isOtherRoleSelected, setIsOtherRoleSelected] = useState(false);

  // react-hook-form
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
      account_type: '',
      company: '',
      company_role: '',
      profile_url_type: 'website',
      website: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  // Observed fields
  const accountType = watch('account_type');
  const companyValue = watch('company');
  const companyRoleValue = watch('company_role');
  const selectedService = watch('services');
  const websiteValue = watch('website');

  // Partner roles
  const partnerRoles = [
    'Owner or Executive',
    'Team Member',
    'Independent Consultant',
    'Event Organizer',
  ];

  function handleRoleClick(role: string) {
    if (role === 'Other') {
      setIsOtherRoleSelected(true);
      setValue('company_role', '');
    } else {
      setIsOtherRoleSelected(false);
      setValue('company_role', role);
    }
  }

  // Next button logic – if validation fails, show one message
  const handleNext = async () => {
    setStepError(null);
    let fieldsToValidate: Array<keyof OnboardingFormData> = [];

    if (currentStep === 1) {
      // Step 1 => check for account_type
      fieldsToValidate = ['account_type'];
    } else if (currentStep === 2) {
      // Step 2 => company & role
      fieldsToValidate = ['company', 'company_role'];
    } else if (currentStep === 3) {
      // Step 3 => must check the "acknowledge" checkbox
      if (!acknowledge) {
        setStepError('Please fill out all required fields to continue.');
        return;
      }
      setCurrentStep(4);
      return;
    }

    // run react-hook-form validation
    const ok = await trigger(fieldsToValidate);
    if (!ok) {
      setStepError('Please fill out all required fields to continue.');
      return;
    }

    // If user picks "direct" on step 1 => jump straight to step 4
    if (currentStep === 1 && accountType === 'direct') {
      setCurrentStep(4);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  // Final submission
  const onSubmit = async (data: OnboardingFormData) => {
    // Validate fields in final step
    const ok = await trigger(['fullName', 'services', 'website']);
    if (!ok) {
      setStepError('Please fill out all required fields to continue.');
      return;
    }

    if (!user) return; // sanity check

    try {
      setIsSubmitting(true);
      setStepError(null);
      setProgress(20);

      // 1) Update user in supabase
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
          services: data.services,
          account_type: data.account_type,
          company: data.company || null,
          company_role: data.company_role || null,
          profile_url_type: data.profile_url_type,
          website: data.website || null,
        });
      if (profileError) throw profileError;
      setProgress(60);

      // 3) Webhook (this is where we do 1 call)
      const onboardingOk = await sendOnboardingWebhook(
        'https://n8n.speakerdrive.com/webhook/onboarding',
        {
          message: 'onboarding_init',
          email: user.email,
          display_name: data.fullName,
          services: data.services,
          account_type: data.account_type,
          company: data.company || null,
          company_role: data.company_role || null,
          profile_url_type: data.profile_url_type,
          website: data.website || null,
        }
      );
      if (!onboardingOk) {
        throw new Error('Failed to send onboarding webhook after multiple attempts');
      }
      setProgress(100);

      // 4) Redirect to "Ask SpeakerDrive" page
      // (If you see 2 webhooks, there's likely a second webhook call in some other code.)
      navigate('/chat/conversation?source=onboarding&trigger=auto');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to complete onboarding';
      console.error('[Onboarding Error]', msg);
      setStepError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check user session + fetch profile
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
          // If they already had a display_name, prefill
          const { data: profile, error: profErr } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', session.user.id)
            .single();
          if (!profErr && profile?.display_name && isMounted) {
            setValue('fullName', profile.display_name);
          }
        }
      } catch (err) {
        console.error('[Onboarding Auth Check Error]', err);
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

  // If loading user data
  if (isLoading) {
    return (
      <AuthLayout
        title="Welcome!"
        subtitle="Let's get started using SpeakerDrive"
      >
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#2864ec]" />
            <p className="text-sm text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Render
  return (
    <AuthLayout
      title="Welcome!"
      subtitle="Let's get started using SpeakerDrive"
      wide
    >
      <div className="space-y-6">
        {/* Single top-level error display */}
        {stepError && (
          <div className="p-3 rounded-md bg-red-50 flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{stepError}</p>
          </div>
        )}

        {/* The main onboarding form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <label className="block text-lg font-semibold text-gray-800">
                Which best describes you?
              </label>
              <div className="flex gap-3 mt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setValue('account_type', 'direct');
                  }}
                  className={`
                    inline-flex items-center px-5 py-3 text-sm font-medium rounded-full border transition-colors
                    ${
                      accountType === 'direct'
                        ? 'bg-[#2864ec] text-white border-[#2864ec]'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Mic className="inline-block w-4 h-4 mr-2" />
                  I&apos;m a Speaker, Coach, or Expert
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setValue('account_type', 'partner');
                  }}
                  className={`
                    inline-flex items-center px-5 py-3 text-sm font-medium rounded-full border transition-colors
                    ${
                      accountType === 'partner'
                        ? 'bg-[#2864ec] text-white border-[#2864ec]'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Users className="inline-block w-4 h-4 mr-2" />
                  I Support or Represent Speakers or Experts
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-md
                    text-white font-medium
                    transition-all duration-150
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2864ec]
                    ${
                      isSubmitting
                        ? 'bg-[#2864ec]/70 cursor-not-allowed'
                        : 'bg-[#2864ec] hover:bg-[#1f58d6] active:scale-[0.98]'
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
              <div>
                <p className="text-lg font-semibold text-gray-800 mb-1">
                  Excited to have you as an Industry Partner!
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  We love working with agencies and service providers.
                  <br />
                  Let&apos;s get to know you better.
                </p>
              </div>

              {/* Company Name */}
              <div className="max-w-md">
                <Input
                  label="Company Name"
                  type="text"
                  icon={Building}
                  disabled={isSubmitting}
                  {...register('company')}
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Your Role
                </label>
                <div className="flex gap-3 mt-2 flex-wrap">
                  {partnerRoles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleClick(role)}
                      className={`
                        inline-block px-4 py-2 text-sm font-medium rounded-full border transition-colors
                        ${
                          companyRoleValue === role
                            ? 'bg-[#2864ec] text-white border-[#2864ec]'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      {role}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleRoleClick('Other')}
                    className={`
                      inline-block px-4 py-2 text-sm font-medium rounded-full border transition-colors
                      ${
                        isOtherRoleSelected
                          ? 'bg-[#2864ec] text-white border-[#2864ec]'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    Other
                  </button>
                </div>

                {isOtherRoleSelected && (
                  <div className="max-w-md mt-3">
                    <Input
                      label=""
                      type="text"
                      icon={Briefcase}
                      maxLength={20}
                      placeholder="Type your role..."
                      disabled={isSubmitting}
                      {...register('company_role')}
                    />
                  </div>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-md
                    text-white font-medium
                    transition-all duration-150
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2864ec]
                    ${
                      isSubmitting
                        ? 'bg-[#2864ec]/70 cursor-not-allowed'
                        : 'bg-[#2864ec] hover:bg-[#1f58d6] active:scale-[0.98]'
                    }
                  `}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div>
                <p className="text-xl font-semibold text-gray-800 mb-1">
                  See SpeakerDrive in Action
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Experience the Platform as Your Client
                </p>
                <p className="text-base text-gray-600 mb-3">
                  To get the most out of SpeakerDrive, we recommend setting up a profile <em>as if you were</em> one of your clients. This allows you to experience the benefits of the platform first-hand.
                </p>

                <ul className="list-none space-y-3 text-base text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckSquare className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
                    <div>
                      <strong>Private:</strong> Your client profile is only visible to you.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckSquare className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
                    <div>
                      <strong>Secure:</strong> We never contact your clients.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckSquare className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
                    <div>
                      <strong>Coming Soon:</strong> Agency Mode to manage multiple clients seamlessly.
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!acknowledge || isSubmitting}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-md
                    text-white font-medium
                    transition-all duration-150
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2864ec]
                    ${
                      isSubmitting
                        ? 'bg-[#2864ec]/70 cursor-not-allowed'
                        : !acknowledge
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-[#2864ec] hover:bg-[#1f58d6] active:scale-[0.98]'
                    }
                  `}
                >
                  Got it!
                </button>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="acknowledge"
                  checked={acknowledge}
                  onChange={(e) => setAcknowledge(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#2864ec]"
                />
                <label
                  htmlFor="acknowledge"
                  className="text-sm text-gray-700 select-none"
                >
                  I understand on the next page, I will be <strong>entering my client&apos;s information, not my own</strong>.
                </label>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <section className="space-y-2 max-w-md">
                <h3 className="text-lg font-semibold text-gray-800">
                  Your Name
                </h3>
                <Input
                  label=""
                  type="text"
                  icon={UserIcon}
                  disabled={isSubmitting}
                  {...register('fullName')}
                  className="
                    w-full
                    transition-shadow
                    focus:shadow-sm
                    focus:ring-2
                    focus:ring-[#2864ec]
                    focus:outline-none
                  "
                />
              </section>

              <section className="space-y-2 max-w-md">
                <h3 className="text-lg font-semibold text-gray-800">
                  Primary Service
                </h3>
                <ServiceSelector
                  selectedService={selectedService}
                  onChange={(val) => setValue('services', val)}
                  disabled={isSubmitting}
                  error={errors.services?.message}
                />
              </section>

              <section className="space-y-2 max-w-md">
                <h3 className="text-lg font-semibold text-gray-800">
                  Website
                </h3>
                <WebsiteInput
                  value={websiteValue}
                  onChange={(e) => setValue('website', e.target.value)}
                  disabled={isSubmitting}
                  profile_url_type="website"
                  error={errors.website?.message}
                />
              </section>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md
                    text-white font-medium
                    transition-all duration-150
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2864ec]
                    ${
                      isSubmitting
                        ? 'bg-[#2864ec]/70 cursor-not-allowed'
                        : 'bg-[#2864ec] hover:bg-[#1f58d6] active:scale-[0.98]'
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
