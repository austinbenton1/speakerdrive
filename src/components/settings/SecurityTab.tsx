import React, { useState } from 'react';
import { Key, Shield, AlertCircle, Check, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import Input from '../Input';
import { validatePassword } from '../../utils/validation';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SecurityTab() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Validate new password
      const passwordError = validatePassword(formData.newPassword);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      // Validate password confirmation
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (updateError) throw updateError;

      setSuccess('Password updated successfully');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (err) {
      console.error('Error updating password:', err);
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;

      setSuccess('Successfully logged out from all devices');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (err) {
      console.error('Error logging out from all devices:', err);
      setError(err instanceof Error ? err.message : 'Failed to logout from all devices');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicators
  const getPasswordStrength = (password: string): {
    score: number;
    color: string;
    text: string;
  } => {
    let score = 0;
    let checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;

    if (score === 0) return { score: 0, color: 'bg-gray-200', text: 'No password' };
    if (score === 1) return { score: 1, color: 'bg-red-500', text: 'Very weak' };
    if (score === 2) return { score: 2, color: 'bg-orange-500', text: 'Weak' };
    if (score === 3) return { score: 3, color: 'bg-yellow-500', text: 'Fair' };
    if (score === 4) return { score: 4, color: 'bg-blue-500', text: 'Good' };
    return { score: 5, color: 'bg-green-500', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
              <p className="text-sm text-gray-600 mt-1">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Alerts */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          )}

          {/* Password Change Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter your current password"
                  disabled={isLoading}
                  icon={Key}
                />

                <div>
                  <Input
                    label="New Password"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter your new password"
                    disabled={isLoading}
                    icon={Key}
                  />
                  
                  {/* Password Strength Indicator */}
                  {formData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-500">Password strength:</span>
                        <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      
                      {/* Password Requirements */}
                      <div className="mt-2 space-y-1">
                        <p className={`text-xs ${formData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                          • At least 8 characters
                        </p>
                        <p className={`text-xs ${/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                          • At least one uppercase letter
                        </p>
                        <p className={`text-xs ${/[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                          • At least one lowercase letter
                        </p>
                        <p className={`text-xs ${/[0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                          • At least one number
                        </p>
                        <p className={`text-xs ${/[^A-Za-z0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                          • At least one special character
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm your new password"
                  disabled={isLoading}
                  icon={Key}
                  error={
                    formData.confirmPassword && 
                    formData.newPassword !== formData.confirmPassword ? 
                    'Passwords do not match' : undefined
                  }
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Security Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Security Actions</h3>
            <button
              onClick={handleLogoutAllDevices}
              disabled={isLoading}
              className="flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out from All Devices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}