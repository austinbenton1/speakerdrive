import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { sendChatMessage } from '../lib/api/chatbot';
import { useProfile } from '../hooks/useProfile';
import {
  Loader2,
  AlertCircle,
  User,
  HelpCircle,
  Send,
  RotateCcw,
  MessageSquare,
} from 'lucide-react';
import { throttle } from 'lodash';
import ReactMarkdown from 'react-markdown';

interface Message {
  content: string;
  isBot: boolean;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  error?: string;
}

/**
 * Standard portal-based tooltip for "Ideas" button
 */
function TooltipPortal({
  open,
  anchorRef,
  children,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}) {
  const [styles, setStyles] = useState<React.CSSProperties>({ display: 'none' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(typeof document !== 'undefined');
  }, []);

  useLayoutEffect(() => {
    if (!mounted) return;
    if (!open) {
      setStyles({ display: 'none' });
      return;
    }
    const anchorEl = anchorRef.current;
    if (!anchorEl) return;

    const rect = anchorEl.getBoundingClientRect();
    const isDesktop = window.innerWidth >= 768;

    if (!isDesktop) {
      setStyles({
        position: 'absolute',
        bottom: `${window.innerHeight - rect.top + window.scrollY + 8}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        display: 'block',
        width: 'calc(100vw - 2rem)',
        maxWidth: '280px',
        margin: '0 auto',
      });
    } else {
      const tooltipWidth = 380;
      const leftPos =
        rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;
      setStyles({
        position: 'absolute',
        bottom: `${window.innerHeight - rect.top + window.scrollY + 8}px`,
        left: `${leftPos}px`,
        zIndex: 99999,
        display: 'block',
        width: `${tooltipWidth}px`,
      });
    }
  }, [open, anchorRef, mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="ideas-tooltip bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-gray-700 text-sm md:mb-0 mb-4"
      style={styles}
    >
      <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 bg-white border-b border-r border-gray-200 hidden lg:block"></div>
      {open && children}
    </div>,
    document.body
  );
}

export default function ChatConversation() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { profile, loading: profileLoading } = useProfile();

  // User data
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
  const [userServices, setUserServices] = useState<string[]>([]);
  const [userWebsite, setUserWebsite] = useState<string | null>(null);
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);

  // "Thinking" indicator
  const [isThinking, setIsThinking] = useState(false);
  const [hasFiredOnboardingInit, setHasFiredOnboardingInit] = useState(false);

  // Tooltip
  const [showIdeas, setShowIdeas] = useState(false);
  const ideasRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // For scrolling + text area
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Throttle
  const lastMessageTimestamp = useRef<number>(0);
  const THROTTLE_DELAY = 2000;

  // Check if from onboarding
  const isOnboarding = profile?.is_onboarding;

  // Handle hover for desktop
  const handleMouseEnter = () => {
    if (window.innerWidth > 1023) {
      setShowIdeas(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth > 1023) {
      setShowIdeas(false);
    }
  };

  // Handle click for mobile/tablet
  const handleClick = () => {
    if (window.innerWidth <= 1023) {
      setShowIdeas(prev => !prev);
    }
  };

  // Close tooltip when clicking outside on mobile/tablet
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth <= 1023 && 
          ideasRef.current && 
          !ideasRef.current.contains(event.target as Node)) {
        setShowIdeas(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Fetch user data from Supabase
   */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsUserDataLoading(true);

        if (!profile) {
          console.log('No profile data available');
          return;
        }

        // Check onboarding status first
        if (profile.is_onboarding) {
          // Handle onboarding user
          console.log('User is in onboarding');
          // You can add additional onboarding-specific logic here
        }

        setUserEmail(profile.email);
        setUserAvatar(profile.avatar_url);
        setUserDisplayName(profile.display_name);
        setUserServices(profile.services ? profile.services : '');
        setUserWebsite(profile.website ?? null);

      } catch (error) {
        console.error('[ChatConversation] Error fetching user data:', error);
      } finally {
        setIsUserDataLoading(false);
      }
    };

    if (!profileLoading) {
      fetchUserData();
    }
  }, [profile, profileLoading]);

  /**
   * One-time onboarding init
   */
  useEffect(() => {
    if (isUserDataLoading || profileLoading || hasFiredOnboardingInit) return;
    setHasFiredOnboardingInit(true);

    const initializeChat = async () => {
      if (userEmail) {
        try {
          setIsThinking(true);

          const response = await sendChatMessage(
            isOnboarding ? 'onboarding_init' : 'welcome_init',
            userEmail,
            userDisplayName,
            userServices,
            userWebsite
          );

          // Set the message
          setMessages([
            {
              content: response.response,
              isBot: true,
              timestamp: new Date(),
              status: 'sent',
            },
          ]);

        } catch (error) {
          console.error('[ChatConversation] Failed to initialize chat:', error);
        } finally {
          setIsThinking(false);
        }
      }
    };

    initializeChat();
  }, [
    isOnboarding,
    userEmail,
    userDisplayName,
    userServices,
    userWebsite,
    isUserDataLoading,
    profileLoading,
    hasFiredOnboardingInit,
  ]);

  /**
   * Throttled send message
   */
  const throttledSendMessage = useCallback(
    throttle(async (messageContent: string) => {
      if (!userEmail) return;
      const now = Date.now();
      if (now - lastMessageTimestamp.current < THROTTLE_DELAY) {
        console.log('[ChatConversation] Throttled – too soon');
        return;
      }
      lastMessageTimestamp.current = now;

      try {
        setIsThinking(true);
        const response = await sendChatMessage(
          messageContent,
          userEmail,
          userDisplayName,
          userServices,
          userWebsite
        );

        setMessages((prev) => {
          // first finalize the user's "sending" message
          const updated = [...prev];
          const userMsgIndex = updated.findIndex(
            (m) => !m.isBot && m.status === 'sending'
          );
          if (userMsgIndex !== -1) {
            updated[userMsgIndex] = { ...updated[userMsgIndex], status: 'sent' };
          }
          // then push the bot response
          updated.push({
            content: response.response,
            isBot: true,
            timestamp: new Date(),
            status: 'sent',
          });
          return updated;
        });
      } catch (error: any) {
        console.error('[ChatConversation] Error sending message:', error);
        setMessages((prev) => {
          const updated = [...prev];
          const userMsgIndex = updated.findIndex(
            (m) => !m.isBot && m.status === 'sending'
          );
          if (userMsgIndex !== -1) {
            updated[userMsgIndex] = {
              ...updated[userMsgIndex],
              status: 'error',
              error: error.message ?? 'Failed to send message',
            };
          }
          return updated;
        });
      } finally {
        setIsLoading(false);
        setIsThinking(false);
      }
    }, 500),
    [userEmail, userDisplayName, userServices, userWebsite]
  );

  /**
   * Handle user pressing "Send"
   */
  const handleSend = () => {
    if (!message.trim() || isLoading || !userEmail) return;

    const userMsg: Message = {
      content: message.trim(),
      isBot: false,
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessage('');
    setIsLoading(true);

    throttledSendMessage(message.trim());
  };

  /**
   * SHIFT+ENTER => new line, ENTER => send
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Auto-scroll to bottom when new messages arrive or thinking state changes
   */
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    });
  }, []);

  // Scroll to bottom on new messages or thinking state
  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 0);
    return () => clearTimeout(timeoutId);
  }, [messages, isThinking, scrollToBottom]);

  /**
   * Auto-resize the textarea
   */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  /**
   * Cleanup throttle on unmount
   */
  useEffect(() => {
    return () => throttledSendMessage.cancel();
  }, [throttledSendMessage]);

  /**
   * Prevent accidental back swipes
   */
  useEffect(() => {
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  if (isUserDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-600">Initializing chat...</p>
        </div>
      </div>
    );
  }

  const maxChars = 1000;
  const charCount = message.length;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Messages Container */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-4">
          {/* Messages */}
          <div className="space-y-4 py-4">
            {/* If no messages, show welcome */}
            {messages.length === 0 && (
              <div className="text-center space-y-2">
                {isOnboarding ? (
                  <div>
                    <h1 className="text-2xl md:text-4xl font-bold">
                      <span>Welcome to the platform, </span>
                      <span className="bg-gradient-to-r from-[#0066FF] to-[#80D078] bg-clip-text text-transparent">
                        {userDisplayName || 'New User'}
                      </span>
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-xs md:text-base text-gray-600 pt-6">
                      <span>Loading your account, wait a moment…</span>
                    </div>
                  </div>
                ) : (
                  <h1 className="text-2xl md:text-4xl font-bold flex items-center justify-center gap-2">
                    <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-[#0066FF]" />
                    <span className="bg-gradient-to-r from-[#0066FF] to-[#80D078] bg-clip-text text-transparent">
                      Ask SpeakerDrive
                    </span>
                  </h1>
                )}

                {!isOnboarding && (
                  <div className="flex items-center justify-center gap-2 text-xs md:text-base text-gray-600">
                    <span>What can I help you work on today?</span>
                  </div>
                )}
              </div>
            )}

            {/* Chat messages */}
            <div className="mt-6 mb-6 flex flex-col gap-6">
              {messages.map((msg, index) => (
                <div key={index} className="flex items-start gap-4 w-fit max-w-full">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {msg.isBot ? (
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                        <img
                          src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/TT6h28gNIZXvItU0Dzmk/media/67180e69632642282678b099.png"
                          alt="AI"
                          className="w-7 h-7"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center">
                        {userAvatar && userAvatar.trim() ? (
                          <>
                            <User className="w-4 h-4 text-white fallback-icon hidden" />
                            <img
                              src={userAvatar}
                              alt="User"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.style.display = 'none';
                                target.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                              }}
                            />
                          </>
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message content */}
                  <div className="flex-1 min-w-0">
                    <div className={`prose prose-sm max-w-full sm:max-w-[600px] text-[15px] leading-relaxed break-words tracking-[-0.01em] rounded-2xl text-gray-800 chat-message-content`}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.status === 'error' && msg.error && (
                      <div className="mt-2 flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <p>{msg.error}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Thinking bubble if isThinking is true */}
              {isThinking && (
                <div className="flex items-start gap-4 w-fit max-w-full">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="inline-block px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                      Thinking...
                    </p>
                  </div>
                </div>
              )}
              {/* Invisible div for scroll anchoring */}
              <div ref={messagesEndRef} className="h-px" />
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING BUBBLE ~ 25% from bottom */}
      <div className="sticky left-0 right-0 z-50">
        <div className="mx-auto w-full max-w-2xl px-4 mb-[15px]">
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                if (e.target.value.length <= maxChars) {
                  setMessage(e.target.value);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here. Press 'Enter' to start a new line..."
              className="w-full min-h-[80px] resize-none text-base sm:text-sm placeholder-gray-400 focus:outline-none bg-transparent"
              disabled={isLoading || isUserDataLoading}
            />
            <div className="hidden sm:block h-[1px] bg-gray-200 opacity-60 my-2"></div>
            <div className="mt-2 flex items-center justify-between">
              {/* character counter + reset */}
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400 px-3 py-1 bg-gray-50 rounded-md">
                  {charCount}/{maxChars}
                </span>
                <RotateCcw
                  onClick={() => setMessage('')}
                  className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                />
                <div 
                  className="relative inline-flex items-center" 
                  ref={ideasRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    onClick={handleClick}
                    className="flex items-center text-xs md:text-base text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 md:w-5 md:h-5 mr-1" />
                  </button>
                </div>
              </div>

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className={`inline-flex items-center px-6 py-2 rounded-md text-sm font-medium ${
                  !message.trim() || isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#0066FF] text-white hover:bg-[#009E3A] active:bg-[#00B341] transition-colors'
                }`}
              >
                <Send
                  className={`w-4 h-4 mr-2 ${
                    !message.trim() || isLoading ? 'text-gray-400' : 'text-white'
                  }`}
                />
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip styling */}
      <style>
        {`
          .ideas-tooltip {
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1),
                        0 2px 4px -2px rgb(0 0 0 / 0.1);
            border-radius: 8px;
          }
        `}
      </style>

      {/* Portal for "Ideas" */}
      <TooltipPortal open={showIdeas} anchorRef={ideasRef}>
        <p className="mb-2 font-semibold text-left">I can help with:</p>
        <ul className="list-disc list-inside space-y-1 text-left">
          <li>Strategies for winning more opportunities</li>
          <li>Advice on growing your expert business</li>
          <li>Questions about using SpeakerDrive features</li>
          <li>Share feedback and feature ideas</li>
          <li>Here to guide your success journey</li>
        </ul>
      </TooltipPortal>
    </div>
  );
}
