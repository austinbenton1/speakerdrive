import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, CreditCard, Shield, Users, Image } from 'lucide-react';
import { useAdminRole } from '../hooks/useAdminRole';

const settingsNavItems = [
  { icon: User, label: 'Profile', path: '/settings/profile' },
  { icon: Shield, label: 'Security', path: '/settings/security' },
  { icon: CreditCard, label: 'Billing', path: '/settings/billing' },
];

const adminNavItems = [
  { icon: Users, label: 'Users Management', path: '/users' },
  { icon: Image, label: 'Store Images', path: '/store-image' },
];

export default function Settings() {
  const location = useLocation();
  const { isAdmin } = useAdminRole();
  const isSettingsRoot = location.pathname === '/settings';

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isSettingsRoot && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          </div>
        )}

        {isSettingsRoot && <div className="space-y-8">
          {/* User Settings */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 text-gray-400 mr-2" />
              User Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {settingsNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    group p-6 bg-white rounded-xl shadow-sm border border-gray-200/75
                    hover:border-blue-500/50 hover:shadow-md transition-all duration-200
                    ${location.pathname === item.path 
                      ? 'ring-1 ring-blue-500/20 border-blue-500/50 shadow-md' 
                      : 'hover:bg-gradient-to-br hover:from-white hover:to-blue-50/20'
                    }
                  `}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${location.pathname === item.path
                          ? 'bg-blue-50 text-blue-500'
                          : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'
                        }
                        transition-colors duration-200
                      `}>
                        <item.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {item.label}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.label === 'Profile' 
                          ? 'Manage your profile and preferences'
                          : item.label === 'Security'
                          ? 'Manage your account security'
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
              <div className="flex items-center gap-2 mb-4 relative">
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-500/20 rounded-r-full" />
                <Shield className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Admin Settings</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {adminNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      group p-6 bg-white rounded-xl shadow-sm border border-gray-200/75
                      hover:border-purple-500/50 hover:shadow-md transition-all duration-200
                      ${location.pathname === item.path 
                        ? 'ring-1 ring-purple-500/20 border-purple-500/50 shadow-md' 
                        : 'hover:bg-gradient-to-br hover:from-white hover:to-purple-50/20'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center
                          ${location.pathname === item.path
                            ? 'bg-purple-50 text-purple-500'
                            : 'bg-gray-50 text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-500'
                          }
                          transition-colors duration-200
                        `}>
                          <item.icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                          {item.label}
                        </h3>
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
        </div>}
      </div>
    </div>
  );
}