import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import ServiceSelector from '../components/onboarding/ServiceSelector';
import IndustrySelector from '../components/onboarding/IndustrySelector';

const onboardingSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  services: z.array(z.string()).min(1, 'Please select at least one service'),
  industries: z.array(z.string()).min(1, 'Please select at least one industry').max(3, 'Please select no more than 3 industries'),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        await supabase.auth.signOut();
        navigate('/login');
        return;
      }
      setUser(session.user);
    };

    checkUser();
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: user?.user_metadata?.display_name || '',
      services: [],
      industries: [],
    },
  });

  const selectedServices = watch('services', []);
  const selectedIndustries = watch('industries', []);

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) return;

    try {
      setError(null);

      // Update auth metadata with display name only
      const { error: userError } = await supabase.auth.updateUser({
        data: { display_name: data.fullName }
      });

      if (userError) {
        setError('Failed to update user information. Please try again.');
        return;
      }

      // Update profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          services: data.services.join(','),
          industries: data.industries.join(',')
        })
        .eq('id', user.id);

      if (profileError) {
        setError('Failed to save profile information. Please try again.');
        return;
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <AuthLayout
      title="Welcome to SpeakerDrive"
      subtitle="Let's personalize your experience"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Error Saving Information
                </h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <Input
          label="Full Name"
          id="fullName"
          error={errors.fullName?.message}
          icon={User}
          placeholder="Enter your full name"
          {...register('fullName')}
        />

        <ServiceSelector
          selectedServices={selectedServices}
          onChange={(serviceId) => {
            const newServices = selectedServices.includes(serviceId)
              ? selectedServices.filter(id => id !== serviceId)
              : [...selectedServices, serviceId];
            setValue('services', newServices, { shouldValidate: true });
          }}
          error={errors.services?.message}
        />

        <IndustrySelector
          selectedIndustries={selectedIndustries}
          onChange={(industryId) => {
            const newIndustries = selectedIndustries.includes(industryId)
              ? selectedIndustries.filter(id => id !== industryId)
              : [...selectedIndustries, industryId];
            if (newIndustries.length <= 3) {
              setValue('industries', newIndustries, { shouldValidate: true });
            }
          }}
          error={errors.industries?.message}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Continue'}
        </button>
      </form>
    </AuthLayout>
  );
}