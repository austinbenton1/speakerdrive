import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import { signupSchema, type SignupFormData } from '../types/auth';

export default function Signup() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: 'bleuewulf+test01@gmail.com',
      password: 'Password12345!'
    }
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      const displayName = data.email.split('@')[0];

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (signUpError) {
        setError('root', { message: signUpError.message });
        return;
      }

      if (!signUpData.session || !signUpData.user) {
        setError('root', { 
          message: 'Please check your email for verification link before continuing.' 
        });
        return;
      }

      // Redirect to onboarding
      navigate('/onboarding');
    } catch (error) {
      console.error('Signup error:', error);
      setError('root', { 
        message: 'An unexpected error occurred. Please try again.' 
      });
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start finding speaking opportunities today"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {errors.root && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {errors.root.message}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Email address"
            type="email"
            id="email"
            autoComplete="email"
            error={errors.email?.message}
            icon={Mail}
            placeholder="you@example.com"
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            error={errors.password?.message}
            icon={Lock}
            placeholder="Create a secure password"
            {...register('password')}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>

        <div className="text-sm text-center">
          <span className="text-gray-600">Already have an account?</span>{' '}
          <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </a>
        </div>
      </form>
    </AuthLayout>
  );
}