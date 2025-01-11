import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { updateProfile } from '../services/profileService';
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
      fullName: '',
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

      // Update profile
      await updateProfile(user.id, {
        display_name: data.fullName,
        services: data.services,
        industries: data.industries
      });

      // Fetch the complete updated profile
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, email, display_name, services, industries')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Send webhook notification
      try {
        const payload = {
          user: {},
          changes: {
            id: updatedProfile.id,
            email: user.email,
            display_name: updatedProfile.display_name,
            services: updatedProfile.services,
            industries: updatedProfile.industries
          }
        };

        await fetch('https://n8n.speakerdrive.com/webhook/supa-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } catch (webhookError) {
        console.error('Failed to send profile update to webhook:', webhookError);
        // Don't throw - we don't want to fail the onboarding if webhook fails
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      setError(error instanceof Error ? error.message : 'Failed to save profile information');
    }
  };

  // Rest of the component remains the same...
}