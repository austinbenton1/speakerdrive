import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User as UserIcon, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { updateProfile } from '../services/profileService';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import ServiceSelector from '../components/onboarding/ServiceSelector';
import WebsiteInput from '../components/onboarding/WebsiteInput';

const onboardingSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  services: z.string().min(1, 'Please select a service'),
  website: z.string().url('Please enter a valid URL').or(z.literal('')),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

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
        if (error instanceof Error) {
          setError(error.message);
        }
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
    formState: { errors, isSubmitting },
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

  const selectedServices = watch('services', '');
  const website = watch('website', '');

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) return;

    try {
      setError(null);

      await updateProfile(user.id, {
        display_name: data.fullName,
        services: data.services,
        website: data.website || null,
      });

      // Send website data if website is provided
      if (data.website) {
        fetch('https://n8n.speakerdrive.com/webhook/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: user.id,
            website: data.website,
          }),
        }).catch(() => {
          // Ignore errors as per requirement
        });
      }

      // Send profile data
      fetch('https://n8n.speakerdrive.com/webhook/supa-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          array1: [],
          array2: [{
            id: user.id,
            email: user.email,
            display_name: data.fullName,
            services: data.services,
            website: data.website || null,
          }],
        }),
      }).catch(() => {
        // Ignore errors as per requirement
      });

      navigate('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to save profile information. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            Help us personalize your experience
          </p>
        </div>

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
            />
          </div>

          <div>
            <ServiceSelector
              selectedServices={selectedServices}
              onChange={(value) => setValue('services', value)}
              error={errors.services?.message}
              disabled={isSubmitting}
            />
          </div>

          <WebsiteInput
            value={website}
            onChange={(e) => setValue('website', e.target.value)}
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
                Setting Up...
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