import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Search, MessageSquare, 
  Settings, LogOut, ChevronDown, ChevronUp,
  Mail, Link as LinkIcon, Building2, Phone, Wrench,
  Headphones, Sparkles, LineChart, Briefcase, BookOpen
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import minimalLogo from '../assets/speakerdrive-mini-v2.png';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string;
  avatar_url: string | null;
  user_type: 'Admin' | 'Client';
  services: string;
}

interface SidebarProps {
  isMobile?: boolean;
  profile: Profile | null;
  onNavigate?: () => void;
}

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
];

const contactTools = [
  { icon: Mail, label: 'Email Finder', path: '/contact-finder' },
  { icon: Phone, label: 'Mobile Finder', path: '/mobile-finder' },
  { icon: Building2, label: 'Company Finder', path: '/company-finder' },
];

export default function Sidebar({ isMobile, profile, onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [isMinimized, setIsMinimized] = useState(location.pathname === '/find-leads');
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);

  // Update minimized state when location changes
  useEffect(() => {
    if (!isMobile) {
      setIsMinimized(location.pathname === '/find-leads');
    }
  }, [location.pathname, isMobile]);

  const handleMouseEnter = () => {
    if (!isMobile && isMinimized) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && isMinimized) {
      setIsHovered(false);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <nav
      className={`bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-200 ease-in-out ${
        isMinimized && !isHovered ? 'w-16' : ''
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        fontSize: '0.9375rem',
        letterSpacing: '-0.01em',
        width: isMinimized && !isHovered ? undefined : isMobile ? '210px' : '205px'
      }}
    >
      <div className="py-5 px-3">  
        {!isMobile && isMinimized && !isHovered ? (
          <img src={minimalLogo} alt="SpeakerDrive" className="w-8 h-8" />
        ) : (
          <div className="flex items-center space-x-2">
            <img src={minimalLogo} alt="SpeakerDrive" className="w-8 h-8" />
            <span className="text-lg font-semibold truncate">SpeakerDrive</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col h-full">
        {/* Scrollable Section */}
        <div className={`flex-1 px-2.5 py-2 flex flex-col ${isMobile ? 'space-y-2' : 'space-y-3'} overflow-y-auto`}>
          {/* Main Navigation */}
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`
                  flex items-center w-full px-3 py-2 rounded-lg text-[15px] transition-colors text-left font-semibold
                  ${location.pathname === item.path
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${!isMobile && isMinimized && !isHovered ? 'justify-center' : ''}
                `}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className={`ml-3.5 truncate ${!isMobile && isMinimized && !isHovered ? 'hidden' : ''}`}>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Find New Leads Section */}
          <div>
            <div className={`px-1.5 py-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wide ${isMobile ? '' : 'py-1'} ${!isMobile && isMinimized && !isHovered ? 'hidden' : ''}`}>
              Find New Leads
            </div>
            <button
              onClick={() => handleNavigate('/find-leads')}
              className={`
                flex items-center w-full px-3 py-2 rounded-lg text-[15px] transition-colors text-left font-semibold
                ${location.pathname === '/find-leads'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
                ${!isMobile && isMinimized && !isHovered ? 'justify-center' : ''}
              `}
            >
              <Search className="w-4 h-4 flex-shrink-0" />
              <span className={`ml-3.5 truncate ${!isMobile && isMinimized && !isHovered ? 'hidden' : ''}`}>Find Leads</span>
            </button>
          </div>

          {/* Chat Section */}
          <div>
            <div className={`px-1.5 py-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wide ${isMobile ? '' : 'py-1'} ${!isMobile && isMinimized && !isHovered ? 'hidden' : ''}`}>
              Chat
            </div>
            
            {/* Ask SpeakerDrive */}
            <button
              onClick={() => handleNavigate('/chat/conversation')}
              className={`
                flex items-center w-full px-3 py-2 rounded-lg text-[15px] transition-colors text-left font-semibold
                ${location.pathname === '/chat/conversation'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
                ${!isMobile && isMinimized && !isHovered ? 'justify-center' : ''}
              `}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className={`ml-3.5 truncate ${!isMobile && isMinimized && !isHovered ? 'hidden' : ''}`}>Ask SpeakerDrive</span>
            </button>
          </div>

          {/* Toolkit Section */}
          <div className={`${isMobile ? 'mt-4' : ''}`}>
            <div className={`px-1.5 py-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wide ${isMobile ? 'mb-2' : 'py-1'} ${!isMobile && isMinimized && !isHovered ? 'hidden' : ''}`}>
              Toolkit
            </div>

            {/* Tools Dropdown (formerly Resources) */}
            <div>
              <button
                onClick={() => setIsResourcesOpen(prev => !prev)}
                className={`
                  flex items-center w-full px-3 py-2 rounded-lg text-[15px] transition-colors text-left font-semibold
                  ${location.pathname.startsWith('/resources') || isResourcesOpen
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${!isMobile && isMinimized && !isHovered ? 'justify-center' : ''}
                `}
              >
                <Wrench className="w-4 h-4 flex-shrink-0" />
                {(isMobile || !isMinimized || isHovered) && (
                  <>
                    <span className="resources-text ml-3.5 flex-1 truncate">Tools</span>
                    {isResourcesOpen ? (
                      <ChevronUp className="w-4 h-4 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-2" />
                    )}
                  </>
                )}
              </button>

              {/* Dropdown Content */}
              {isResourcesOpen && (isMobile || !isMinimized || isHovered) && (
                <div className="ml-4 mt-1 space-y-1">
                  {/* Contact Tools */}
                  {contactTools.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`
                        flex items-center w-full px-3 py-2 rounded-lg text-[15px] transition-colors text-left font-semibold
                        ${location.pathname === item.path
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="ml-3.5 truncate">{item.label}</span>
                    </button>
                  ))}

                  {/* Instant Intel */}
                  <button
                    onClick={() => handleNavigate('/chat')}
                    className={`
                      flex items-center w-full px-3 py-2 rounded-lg text-[15px] transition-colors text-left font-semibold
                      ${location.pathname === '/chat'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <LineChart className="w-4 h-4 flex-shrink-0" />
                    <span className="ml-3.5 truncate">Instant Intel</span>
                  </button>

                  {/* Sales Coach */}
                  <button
                    onClick={() => handleNavigate('/chat/sales-coach')}
                    className={`
                      flex items-center w-full px-3 py-2 rounded-lg text-[15px] transition-colors text-left font-semibold
                      ${location.pathname === '/chat/sales-coach'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Headphones className="w-4 h-4 flex-shrink-0" />
                    <span className="ml-3.5 truncate">Sales Coach</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Fixed Section - Only for Desktop */}
        {!isMobile && (
          <div className="px-2.5 pb-3 mt-auto">
            {/* Unlocked Leads */}
            <div>
              <button
                onClick={() => handleNavigate('/leads')}
                className={`
                  flex items-center w-full px-2.5 py-2 rounded-lg text-[15px] transition-colors text-left font-semibold
                  ${location.pathname === '/leads'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${!isMobile && isMinimized && !isHovered ? 'justify-center' : ''}
                `}
              >
                <Briefcase className="w-4 h-4 flex-shrink-0" />
                <span className={`ml-3 truncate ${!isMobile && isMinimized && !isHovered ? 'hidden' : ''}`}>Unlocked Leads</span>
              </button>
            </div>

            {/* Settings and Logout */}
            <div>
              <div className={`border-t border-gray-200 my-1.5`} />
              <div className="space-y-0.5">
                <button
                  onClick={() => handleNavigate('/settings')}
                  className={`
                    flex items-center w-full px-3 py-2 rounded-lg text-[15px] transition-colors text-left font-semibold
                    ${location.pathname === '/settings'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  <span className="ml-3.5 truncate">Settings</span>
                </button>
                <button
                  onClick={() => supabase.auth.signOut().then(() => navigate('/login'))}
                  className="flex items-center w-full px-3 py-2 rounded-lg text-[15px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left font-semibold"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span className="ml-3.5 truncate">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Section */}
        {isMobile && (
          <div className="px-2.5 pb-3">
            {/* Unlocked Leads */}
            <div>
              <button
                onClick={() => handleNavigate('/leads')}
                className={`
                  flex items-center w-full px-3 py-2 rounded-lg text-[15px] transition-colors text-left font-semibold
                  ${location.pathname === '/leads'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Briefcase className="w-4 h-4 flex-shrink-0" />
                <span className="ml-3.5 truncate">Unlocked Leads</span>
              </button>
            </div>

            {/* Settings and Logout */}
            <div>
              <div className={`border-t border-gray-200 my-1.5`} />
              <div className="space-y-0.5">
                <button
                  onClick={() => handleNavigate('/settings')}
                  className={`
                    flex items-center w-full px-3 py-2 rounded-lg text-[15px] transition-colors text-left font-semibold
                    ${location.pathname === '/settings'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  <span className="ml-3.5 truncate">Settings</span>
                </button>
                <button
                  onClick={() => supabase.auth.signOut().then(() => navigate('/login'))}
                  className="flex items-center w-full px-3 py-2 rounded-lg text-[15px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left font-semibold"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span className="ml-3.5 truncate">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}