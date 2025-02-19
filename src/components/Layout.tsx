import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { User, Shield, Image, Users, ChevronDown, Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { useProfile } from '../hooks/useProfile';
import { useAvatarStore } from '../lib/store';
import { useAdminRole } from '../hooks/useAdminRole';
import LoadingSpinner from './common/LoadingSpinner';
import minimalLogo from '../assets/speakerdrive-mini-v2.png';

export default function Layout() {
  const navigate = useNavigate();
  const { profile, loading, error } = useProfile();
  const globalAvatarUrl = useAvatarStore((state) => state.avatarUrl);
  const { isAdmin } = useAdminRole();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();

  // Determine if the current route is a chat page.
  // Adjust this condition as needed.
  const isChatPage = location.pathname.includes('chat');

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
    if (profile.display_name) {
      const fullName = profile.display_name;
      return {
        full: fullName,
        first: fullName.split(' ')[0],
      };
    }
    const [username] = profile.email.split('@');
    const formattedName = username
      .split(/[._-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return {
      full: formattedName,
      first: formattedName.split(' ')[0],
    };
  };

  const displayName = getDisplayName();

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <div className="hidden sm:block h-screen sticky top-0">
        <Sidebar profile={profile} />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <header className="bg-white border-b border-gray-200 h-16 flex-none flex items-center px-4 sm:px-6 relative z-20 sticky top-0">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="sm:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>

          {/* Logo - Mobile Only */}
          <div className="sm:hidden absolute left-1/2 transform -translate-x-1/2">
            <Link to="/dashboard">
              <img
                src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/TT6h28gNIZXvItU0Dzmk/media/67180e69ea401b8de01a84c5.png"
                alt="SpeakerDrive"
                className="h-6 w-auto"
              />
            </Link>
          </div>

          {/* Admin Menu - Desktop Only */}
          <div className="hidden sm:flex sm:flex-1 items-center">
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setShowAdminMenu(!showAdminMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  <Shield className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Admin</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                {showAdminMenu && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
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
          </div>

          {/* User Profile */}
          <div className="flex items-center ml-auto">
            <div className="flex items-center space-x-3">
              <img
                src={globalAvatarUrl || profile.avatar_url}
                alt={displayName.full}
                className="h-8 w-8 rounded-full border border-gray-200 shadow-sm object-cover bg-white"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = minimalLogo;
                }}
              />
              <div className="flex flex-col">
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {displayName.full}
                </span>
                <span className="sm:hidden text-sm font-medium text-gray-700">
                  {displayName.first}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 z-30 ${
            showMobileMenu ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          <div
            className={`absolute inset-0 bg-gray-600 transition-opacity duration-300 ${
              showMobileMenu ? 'opacity-50' : 'opacity-0'
            }`}
            onClick={() => setShowMobileMenu(false)}
          />
          <div
            className={`absolute inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
              showMobileMenu ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <Sidebar
              profile={profile}
              isMobile={true}
              onNavigate={() => setShowMobileMenu(false)}
            />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
