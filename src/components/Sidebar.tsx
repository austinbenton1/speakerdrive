import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Search, MessageSquare, 
  Settings, LogOut, ChevronDown, ChevronUp,
  Mail, Link as LinkIcon, Building2, Phone, Wrench,
  Headphones, Sparkles, LineChart, Briefcase
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
  const [isAiToolsOpen, setIsAiToolsOpen] = useState(false);
  const [isContactToolsOpen, setIsContactToolsOpen] = useState(false);

  // Start minimized on Find Leads page
  const [isMinimized, setIsMinimized] = useState(location.pathname === '/find-leads');

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
    <div
      className={`bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-200 ease-in-out ${
        isMobile ? 'w-64' : isMinimized && !isHovered ? 'w-16' : 'w-64'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="py-5 px-4">
        {!isMobile && isMinimized && !isHovered ? (
          <img 
            src={minimalLogo}
            alt="SpeakerDrive"
            className="h-8 w-8 mx-auto transition-all duration-300"
          />
        ) : (
          <img 
            src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/TT6h28gNIZXvItU0Dzmk/media/67180e69ea401b8de01a84c5.png" 
            alt="SpeakerDrive" 
            className="h-6 w-auto ml-2 transition-all duration-300"
          />
        )}
      </div>
      
      <div className={`flex-1 px-2.5 py-2 flex flex-col ${isMobile ? 'space-y-2' : 'space-y-8'}`}>
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
              <span className={`ml-2.5 ${!isMobile && isMinimized && !isHovered ? 'hidden' : ''}`}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Find New Leads Section */}
        <div>
          <div className={`px-1.5 py-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wide ${isMobile ? '' : 'py-3'} ${!isMobile && isMinimized && !isHovered ? 'hidden' : ''}`}>
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
            <span className={`ml-2.5 ${!isMobile && isMinimized && !isHovered ? 'hidden' : ''}`}>Find Leads</span>
          </button>
        </div>

        {/* Tools Section */}
        <div>
          <div className={`px-1.5 py-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wide ${isMobile ? '' : 'py-3'} ${!isMobile && isMinimized && !isHovered ? 'hidden' : ''}`}>
            Tools
          </div>
          
          {/* AI Tools Section */}
          <div className="space-y-1">
            <button
              onClick={() => setIsAiToolsOpen(!isAiToolsOpen)}
              className={`
                flex items-center w-full px-3 py-2 rounded-lg text-[15px] transition-colors text-left font-semibold
                ${isAiToolsOpen ? 'text-gray-900' : 'text-gray-700 hover:text-gray-900'}
                ${!isMobile && isMinimized && !isHovered ? 'justify-center' : ''}
              `}
            >
              <div className={`flex items-center ${!isMobile && isMinimized && !isHovered ? 'w-auto' : 'w-full'}`}>
                <div className="flex items-center">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span className={`ml-2.5 ${!isMobile && isMinimized && !isHovered ? 'hidden' : ''}`}>AI Tools</span>
                </div>
                <div className={`ml-auto ${!isMobile && isMinimized && !isHovered ? 'hidden' : ''}`}>
                  {isAiToolsOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>
            </button>

            {isAiToolsOpen && (
              <div className="space-y-1">
                {/* Ask SpeakerDrive - No indent */}
                <button
                  onClick={() => handleNavigate('/chat/conversation')}
                  className={`
                    flex items-center w-full px-3 py-1.5 rounded-lg text-[15px] transition-colors text-left
                    ${location.pathname === '/chat/conversation'
                      ? 'text-blue-700 font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                    }
                    ${!isMobile && isMinimized && !isHovered ? 'justify-center' : ''}
                  `}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className={`ml-2.5 ${!isMobile && isMinimized && !isHovered ? 'hidden' : ''}`}>Ask SpeakerDrive</span>
                </button>

                {/* Indented items with vertical line */}
                <div className="relative ml-4">
                  {/* Vertical line */}
                  <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200/75 rounded-full" />
                  
                  {/* Indented items */}
                  <div className="pl-4">
                    {/* Instant Intel */}
                    <button
                      onClick={() => handleNavigate('/chat')}
                      className={`
                        flex items-center w-full px-3 py-1.5 rounded-lg text-[15px] transition-colors text-left
                        ${location.pathname === '/chat'
                          ? 'text-blue-700 font-medium'
                          : 'text-gray-600 hover:text-gray-900'
                        }
                        ${!isMobile && isMinimized && !isHovered ? 'justify-center' : ''}
                      `}
                    >
                      <LineChart className="w-4 h-4 flex-shrink-0" />
                      <span className={`ml-2.5 ${!isMobile && isMinimized && !isHovered ? 'hidden' : ''}`}>Instant Intel</span>
                    </button>

                    {/* Sales Coach */}
                    <button
                      onClick={() => handleNavigate('/chat/sales-coach')}
                      className={`
                        flex items-center w-full px-3 py-1.5 rounded-lg text-[15px] transition-colors text-left
                        ${location.pathname === '/chat/sales-coach'
                          ? 'text-blue-700 font-medium'
                          : 'text-gray-600 hover:text-gray-900'
                        }
                        ${!isMobile && isMinimized && !isHovered ? 'justify-center' : ''}
                      `}
                    >
                      <Headphones className="w-4 h-4 flex-shrink-0" />
                      <span className={`ml-2.5 ${!isMobile && isMinimized && !isHovered ? 'hidden' : ''}`}>Sales Coach</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Tools Section */}
          <div className={`space-y-1 ${isMobile ? 'mt-0.5' : 'mt-1'}`}>
            <button
              onClick={() => setIsContactToolsOpen(!isContactToolsOpen)}
              className={`
                flex items-center w-full px-3 py-2 rounded-lg text-[15px] transition-colors text-left font-semibold
                ${isContactToolsOpen ? 'text-gray-900' : 'text-gray-700 hover:text-gray-900'}
                ${!isMobile && isMinimized && !isHovered ? 'justify-center' : ''}
              `}
            >
              <div className={`flex items-center ${!isMobile && isMinimized && !isHovered ? 'w-auto' : 'w-full'}`}>
                <div className="flex items-center">
                  <Wrench className="w-4 h-4 flex-shrink-0" />
                  <span className={`ml-2.5 ${!isMobile && isMinimized && !isHovered ? 'hidden' : ''}`}>Contact Tools</span>
                </div>
                <div className={`ml-auto ${!isMobile && isMinimized && !isHovered ? 'hidden' : ''}`}>
                  {isContactToolsOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>
            </button>

            {isContactToolsOpen && (
              <div className="space-y-1">
                {contactTools.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`
                      flex items-center w-full px-3 py-1.5 rounded-lg text-[15px] transition-colors text-left
                      ${location.pathname === item.path
                        ? 'text-blue-700 font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                      }
                      ${!isMobile && isMinimized && !isHovered ? 'justify-center' : ''}
                    `}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className={`ml-2.5 ${!isMobile && isMinimized && !isHovered ? 'hidden' : ''}`}>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

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
              ${!isMobile && isMinimized && !isHovered ? 'justify-center' : ''}
            `}
          >
            <Briefcase className="w-4 h-4 flex-shrink-0" />
            <span className={`ml-2.5 ${!isMobile && isMinimized && !isHovered ? 'hidden' : ''}`}>Unlocked Leads</span>
          </button>
        </div>

        {/* Settings and Logout */}
        <div>
          <div className={`border-t border-gray-200 ${isMobile ? 'my-1' : 'my-2'}`} />
          <div className="space-y-1">
            <button
              onClick={() => handleNavigate('/settings')}
              className={`
                flex items-center w-full px-3 py-2 rounded-lg text-[15px] transition-colors text-left font-semibold
                ${location.pathname === '/settings'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
                ${!isMobile && isMinimized && !isHovered ? 'justify-center' : ''}
              `}
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              <span className={`ml-2.5 ${!isMobile && isMinimized && !isHovered ? 'hidden' : ''}`}>Settings</span>
            </button>
            <button
              onClick={() => supabase.auth.signOut().then(() => navigate('/login'))}
              className="flex items-center w-full px-3 py-2 rounded-lg text-[15px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left font-semibold"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span className={`ml-2.5 ${!isMobile && isMinimized && !isHovered ? 'hidden' : ''}`}>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}