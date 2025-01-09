import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Search, MessageSquare, 
  Settings, LogOut, ChevronDown, ChevronUp,
  Mail, Link as LinkIcon, Building2, Phone, Wrench,
  Headphones, Sparkles, LineChart, Briefcase
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import speakerMiniLogo from '../assets/speakerdrive-mini.png';

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
];

const contactTools = [
  { icon: Mail, label: 'Email Finder', path: '/contact-finder' },
  { icon: Phone, label: 'Mobile Finder', path: '/mobile-finder' },
  { icon: Building2, label: 'Company Finder', path: '/company-finder' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [isAiToolsOpen, setIsAiToolsOpen] = useState(false);
  const [isContactToolsOpen, setIsContactToolsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse sidebar on Find Leads page when not hovered
  useEffect(() => {
    if (location.pathname === '/find-leads') {
      setIsCollapsed(!isHovered);
    } else {
      setIsCollapsed(false);
    }
  }, [location.pathname, isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div 
      className={`
        h-screen bg-white border-r border-gray-200 flex flex-col
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-[60px]' : 'w-52'}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`p-4 ${isCollapsed ? 'flex justify-center items-center px-2' : ''}`}>
        {isCollapsed ? (
          <img 
            src={speakerMiniLogo}
            alt="SD" 
            className="h-5 w-auto transition-all duration-300"
          />
        ) : (
          <img 
            src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/TT6h28gNIZXvItU0Dzmk/media/67180e69ea401b8de01a84c5.png" 
            alt="SpeakerDrive" 
            className="h-6 w-auto transition-all duration-300"
          />
        )}
      </div>
      
      <nav className="flex-1 px-2.5 space-y-0.5">
        {/* Main Nav Items */}
        {mainNavItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`
              flex items-center w-full px-3 py-2 rounded-lg text-[15px] transition-colors text-left font-semibold
              ${location.pathname === item.path
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="ml-2.5">{item.label}</span>}
          </button>
        ))}

        {/* Find New Leads Section */}
        {!isCollapsed && (
          <div className="px-1.5 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide mt-5">
            Find New Leads
          </div>
        )}

        {/* Find Leads Button */}
        <button
          onClick={() => navigate('/find-leads')}
          className={`
            flex items-center w-full px-3 py-2 rounded-lg text-[15px] transition-colors text-left font-semibold
            ${location.pathname === '/find-leads'
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
        >
          <Search className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="ml-2.5">Find Leads</span>}
        </button>

        {/* Tools Section Header */}
        {!isCollapsed && (
          <div className="px-1.5 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide mt-5">
            Tools
          </div>
        )}

        {/* AI Tools Section */}
        <div>
          <button
            onClick={() => setIsAiToolsOpen(!isAiToolsOpen)}
            className={`
              flex items-center w-full px-3 py-2 rounded-lg text-[15px] transition-colors text-left font-semibold
              ${isAiToolsOpen ? 'text-gray-900' : 'text-gray-700 hover:text-gray-900'}
            `}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span className="ml-2.5">AI Tools</span>}
              </div>
              {!isCollapsed && (
                <div className="ml-auto">
                  {isAiToolsOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              )}
            </div>
          </button>

          {isAiToolsOpen && !isCollapsed && (
            <div className="mt-0.5">
              {/* Ask SpeakerDrive - No indent */}
              <button
                onClick={() => navigate('/chat/conversation')}
                className={`
                  flex items-center w-full px-3 py-1.5 rounded-lg text-[15px] transition-colors text-left
                  ${location.pathname === '/chat/conversation'
                    ? 'text-blue-700 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0 mr-2.5" />
                <span className="font-semibold">Ask SpeakerDrive</span>
              </button>

              {/* Indented items with vertical line */}
              <div className="relative ml-4">
                {/* Vertical line */}
                <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200/75 rounded-full" />
                
                {/* Indented items */}
                <div className="pl-4">
                  {/* Instant Intel */}
                  <button
                    onClick={() => navigate('/chat')}
                    className={`
                      flex items-center w-full px-3 py-1.5 rounded-lg text-[15px] transition-colors text-left
                      ${location.pathname === '/chat'
                        ? 'text-blue-700 font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                      }
                    `}
                  >
                    <LineChart className="w-4 h-4 flex-shrink-0 mr-2.5" />
                    <span>Instant Intel</span>
                  </button>

                  {/* Sales Coach */}
                  <button
                    onClick={() => navigate('/chat/sales-coach')}
                    className={`
                      flex items-center w-full px-3 py-1.5 rounded-lg text-[15px] transition-colors text-left
                      ${location.pathname === '/chat/sales-coach'
                        ? 'text-blue-700 font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                      }
                    `}
                  >
                    <Headphones className="w-4 h-4 flex-shrink-0 mr-2.5" />
                    <span>Sales Coach</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contact Tools Section */}
        <div>
          <button
            onClick={() => setIsContactToolsOpen(!isContactToolsOpen)}
            className={`
              flex items-center w-full px-3 py-2 rounded-lg text-[15px] transition-colors text-left font-semibold
              ${isContactToolsOpen ? 'text-gray-900' : 'text-gray-700 hover:text-gray-900'}
            `}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Wrench className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span className="ml-2.5">Contact Tools</span>}
              </div>
              {!isCollapsed && (
                <div className="ml-auto">
                  {isContactToolsOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              )}
            </div>
          </button>

          {isContactToolsOpen && !isCollapsed && (
            <div className="space-y-0.5 mt-0.5">
              {contactTools.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
                    flex items-center w-full px-3 py-1.5 rounded-lg text-[15px] transition-colors text-left
                    ${location.pathname === item.path
                      ? 'text-blue-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0 mr-2.5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Unlocked Leads Button */}
      <div className="px-2.5">
        <button
          onClick={() => navigate('/leads')}
          className={`
            flex items-center w-full px-3 py-2 rounded-lg text-[15px] transition-colors text-left font-semibold
            ${location.pathname === '/leads'
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
        >
          <Briefcase className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="ml-2.5">Unlocked Leads</span>}
        </button>
      </div>

      {/* Settings and Logout */}
      <div className="px-2.5 pb-4">
        <div className="border-t border-gray-200 my-2" />
        <button
          onClick={() => navigate('/settings')}
          className={`
            flex items-center w-full px-3 py-2 rounded-lg text-[15px] transition-colors text-left font-semibold
            ${location.pathname === '/settings'
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="ml-2.5">Settings</span>}
        </button>
        <button
          onClick={() => supabase.auth.signOut().then(() => navigate('/login'))}
          className="flex items-center w-full px-3 py-2 rounded-lg text-[15px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left font-semibold"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="ml-2.5">Logout</span>}
        </button>
      </div>
    </div>
  );
}