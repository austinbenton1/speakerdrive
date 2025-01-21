import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { User, Shield, Image, Users, ChevronDown } from 'lucide-react';
import Sidebar from './Sidebar';
import { useProfile } from '../hooks/useProfile';
import { useAvatarStore } from '../lib/store';
import { useAdminRole } from '../hooks/useAdminRole';
import LoadingSpinner from './common/LoadingSpinner';

export default function Layout() {
  const navigate = useNavigate();
  const { profile, loading, error } = useProfile();
  const globalAvatarUrl = useAvatarStore((state) => state.avatarUrl);
  const { isAdmin } = useAdminRole();
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  useEffect(() => {
    if (!loading && error) {
      navigate('/login');
    }
  }, [loading, error, navigate]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const getDisplayName = () => {
    if (profile.display_name) return profile.display_name;

    // If no name is available, format the email
    const [username] = profile.email.split('@');
    // Capitalize first letter of each word
    return username
      .split(/[._-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          {/* Admin Menu */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition-colors"
              >
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Admin</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showAdminMenu && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => {
                      navigate('/users');
                      setShowAdminMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Users Management
                  </button>
                  <button
                    onClick={() => {
                      navigate('/store-image');
                      setShowAdminMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Store Images
                  </button>
                </div>
              )}
            </div>
          )}

          {/* User Profile */}
          <div 
            onClick={() => navigate('/settings')}
            className="flex items-center cursor-pointer hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors ml-auto"
          >
            <div className="flex-shrink-0">
              {(globalAvatarUrl || profile.avatar_url) ? (
                <img
                  key={globalAvatarUrl || profile.avatar_url}
                  src={globalAvatarUrl || profile.avatar_url}
                  alt={getDisplayName()}
                  className="w-8 h-8 rounded-full border border-gray-200 shadow-sm object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://www.gravatar.com/avatar/default?d=mp&s=200';
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getDisplayName()}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {profile.user_type}
              </p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}