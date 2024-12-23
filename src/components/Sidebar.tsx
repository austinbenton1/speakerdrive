import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Search, Unlock, Settings, Brain, UserSearch, LogOut, ChevronDown, ChevronUp, Users, Image, Building2, UserRound, UserCog } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useAdminRole } from '../hooks/useAdminRole';

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Search, label: 'Find Leads', path: '/find-leads' },
  { icon: Brain, label: 'SpeakerDrive AI', path: '/chat', subItems: [
    { label: 'Instant Intel', path: '/chat' },
    { label: 'Sales Coach', path: '/chat/sales-coach' },
    { label: 'Ask SpeakerDrive', path: '/chat/conversation' }
  ]},
  { icon: UserSearch, label: 'Contact Finder', path: '/contact-finder' },
  { icon: Building2, label: 'Company Finder', path: '/company-finder' },
  { icon: UserRound, label: 'Role Finder', path: '/role-finder' },
  { icon: UserCog, label: 'Profile Finder', path: '/profile-finder' }
];

const bottomNavItems = [
  { icon: Unlock, label: 'Unlocked Leads', path: '/leads' },
  { icon: Image, label: 'Store Image', path: '/store-image' },
];

const adminItems = [
  { icon: Users, label: 'Users Management', path: '/users' },
];

const settingsItems = [
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useAdminRole();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const NavLink = ({ item }: { item: typeof mainNavItems[0] }) => {
    const isActive = location.pathname === item.path;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItem === item.label;
    const isSubItemActive = hasSubItems && item.subItems.some(subItem => location.pathname === subItem.path);

    return (
      <div>
        <button
          onClick={() => {
            if (hasSubItems) {
              setExpandedItem(isExpanded ? null : item.label);
            } else {
              navigate(item.path);
            }
          }}
          className={`
            flex items-center justify-between w-full px-3 py-2 rounded-lg mb-1 transition-colors text-sm
            ${isActive || isSubItemActive
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          <div className="flex items-center">
            <item.icon className="w-4 h-4 mr-2.5 flex-shrink-0" />
            <span className="font-medium truncate">{item.label}</span>
          </div>
          {hasSubItems && (
            isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {hasSubItems && isExpanded && (
          <div className="ml-9 space-y-1">
            {item.subItems.map((subItem) => (
              <Link
                key={subItem.path}
                to={subItem.path}
                className={`
                  block px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${location.pathname === subItem.path
                    ? 'text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {subItem.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Filter bottom nav items based on admin role
  const filteredBottomNavItems = bottomNavItems.filter(item => {
    if (item.label === 'Store Image') {
      return isAdmin;
    }
    return true;
  });

  return (
    <div className="w-52 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4">
        <img 
          src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/TT6h28gNIZXvItU0Dzmk/media/67180e69ea401b8de01a84c5.png" 
          alt="SpeakerDrive" 
          className="h-6 w-auto mb-6"
        />
      </div>
      
      {/* Main Navigation */}
      <nav className="px-3">
        {mainNavItems.map((item) => (
          <NavLink key={item.path} item={item} />
        ))}
      </nav>

      {/* Flex spacer */}
      <div className="flex-1" />
      
      {/* Bottom Navigation Items */}
      <div className="px-3">
        <div className="space-y-1">
          {filteredBottomNavItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </div>
      </div>

      {/* Admin Items */}
      {isAdmin && (
        <div className="px-3">
          <div className="space-y-1">
            {adminItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-200 my-2" />

      {/* Settings and Logout */}
      <div className="px-3 pb-4">
        {settingsItems.map((item) => (
          <NavLink key={item.path} item={item} />
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4 mr-2.5 flex-shrink-0" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}