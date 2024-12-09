import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Sidebar from './Sidebar';
import { useAvatarStore } from '../lib/store';

interface UserProfile {
  id: string;
  display_name?: string;
  email: string;
  user_role?: string;
  avatar_url?: string | null;
}

export default function Layout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const avatarUrl = useAvatarStore((state) => state.avatarUrl);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.user) {
          navigate('/login');
          return;
        }

        // Fetch profile data including avatar_url
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        setUser({
          id: session.user.id,
          display_name: session.user.user_metadata?.display_name,
          email: session.user.email || '',
          user_role: session.user.user_metadata?.user_role || 'Member',
          avatar_url: profile?.avatar_url
        });

        // Set initial avatar URL in global store
        useAvatarStore.getState().setAvatarUrl(profile?.avatar_url || null);
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [navigate]);

  const getDisplayName = () => {
    if (user?.display_name) return user.display_name;

    // If no name is available, format the email
    if (user?.email) {
      const [username] = user.email.split('@');
      // Capitalize first letter of each word
      return username
        .split(/[._-]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    return 'User';
  };

  const getUserRole = () => {
    return user?.user_role || 'Member';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <div></div>
          <div 
            onClick={() => navigate('/settings')}
            className="flex items-center cursor-pointer hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
          >
            <div className="flex-shrink-0">
              {(avatarUrl || user?.avatar_url) ? (
                <img
                  src={avatarUrl || user?.avatar_url}
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
                {getUserRole()}
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