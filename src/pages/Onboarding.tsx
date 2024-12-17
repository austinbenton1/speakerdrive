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

      await updateProfile(user.id, {
        display_name: data.fullName,
        services: data.services,
        industries: data.industries
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      setError(error instanceof Error ? error.message : 'Failed to save profile information');
    }
  };

  // Rest of the component remains the same...
}