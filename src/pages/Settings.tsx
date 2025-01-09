import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, CreditCard, Shield, Users, Image } from 'lucide-react';
import { useAdminRole } from '../hooks/useAdminRole';

const settingsNavItems = [
  { icon: User, label: 'Profile', path: '/settings/profile' },
  { icon: CreditCard, label: 'Billing', path: '/settings/billing' },
];

const adminNavItems = [
  { icon: Users, label: 'Users Management', path: '/users' },
  { icon: Image, label: 'Store Images', path: '/store-image' },
];

export default function Settings() {
  const location = useLocation();
  const { isAdmin } = useAdminRole();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="space-y-8">
        {/* User Settings */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">User Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {settingsNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  p-6 bg-white rounded-lg shadow-sm border border-gray-200
                  hover:border-blue-500 transition-colors
                  ${location.pathname === item.path ? 'border-blue-500' : ''}
                `}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <item.icon className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{item.label}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {item.label === 'Profile' 
                        ? 'Manage your profile and preferences'
                        : 'Manage your subscription and billing'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Admin Settings */}
        {isAdmin && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-medium text-gray-900">Admin Settings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {adminNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    p-6 bg-white rounded-lg shadow-sm border border-gray-200
                    hover:border-purple-500 transition-colors
                    ${location.pathname === item.path ? 'border-purple-500' : ''}
                  `}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <item.icon className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{item.label}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.label === 'Users Management'
                          ? 'Manage user accounts and permissions'
                          : 'Manage stored images and assets'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}