// /home/project/src/pages/Login.tsx

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import { loginSchema, type LoginFormData } from '../types/auth';
import { checkUserBanStatus } from '../services/userService';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'bleuewulf+test01@gmail.com',
      password: 'Password12345!'
    }
  });

  // --- LINKEDIN ADDED ---
  const handleLinkedInSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          scopes: 'openid profile email'
        }
      });

      if (error) {
        setError(error.message);
        return;
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
  };
  // --- END LINKEDIN ADD ---

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      setIsLoading(true);

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (!signInData.session) {
        setError('Failed to sign in. Please try again.');
        return;
      }

      // Check if user is banned
      const { isBanned } = await checkUserBanStatus(signInData.user.id);
      if (isBanned) {
        await supabase.auth.signOut(); // Sign out the banned user
        setError('Your account has been locked. Please contact support for assistance.');
        return;
      }

      // Successful login - redirect to intended destination
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your SpeakerDrive account"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Authentication Error
                </h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
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
            disabled={isLoading}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            error={errors.password?.message}
            icon={Lock}
            placeholder="Enter your password"
            disabled={isLoading}
            {...register('password')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot your password?
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Signing in...
            </div>
          ) : (
            'Sign in'
          )}
        </button>

        {/* --- LINKEDIN BUTTON --- */}
        <div className="relative mt-6 text-center">
          <hr className="border-gray-200" />
          <span className="bg-white px-2 text-gray-500 text-sm -mt-3 absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            or
          </span>
        </div>
        <button
          type="button"
          onClick={handleLinkedInSignIn}
          className="w-full flex items-center justify-center mt-4 py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
            alt="LinkedIn"
            className="h-5 w-5 mr-2"
          />
          Sign in with LinkedIn
        </button>
        {/* --- END LINKEDIN BUTTON --- */}

        <div className="text-sm text-center mt-4">
          <span className="text-gray-600">Don't have an account?</span>{' '}
          <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </a>
        </div>
      </form>
    </AuthLayout>
  );
}
