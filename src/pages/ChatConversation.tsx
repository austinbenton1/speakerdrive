// /home/project/src/pages/ChatConversation.tsx

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { sendChatMessage } from '../lib/api/chatbot';
import { supabase } from '../lib/supabase';
import {
  Loader2,
  AlertCircle,
  User,
  Lightbulb,
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
 * A small portal wrapper to render children into document.body.
 * - We measure the anchor position and place the tooltip below it.
 * - This approach ensures the tooltip is never clipped by a parent’s overflow.
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

  // In SSR environments (Next.js), 'document' won't exist on first render
  // So we only do measurements/portals once on the client
  useEffect(() => {
    setMounted(typeof document !== 'undefined');
  }, []);

  // Position the tooltip. We use layoutEffect to measure anchorRef in the browser.
  useLayoutEffect(() => {
    if (!mounted) return;
    if (!open) {
      setStyles({ display: 'none' });
      return;
    }
    const anchorEl = anchorRef.current;
    if (!anchorEl) {
      console.warn('[TooltipPortal] anchorRef is null; cannot position tooltip.');
      setStyles({ display: 'none' });
      return;
    }

    const rect = anchorEl.getBoundingClientRect();
    const isDesktop = window.innerWidth >= 768;

    if (!isDesktop) {
      // On mobile, align the tooltip’s right edge to anchor’s right edge.
      // We'll also clamp the width so it doesn't overflow the viewport.
      setStyles({
        position: 'absolute',
        top: `${rect.bottom + window.scrollY + 8}px`,
        left: `${rect.right + window.scrollX - 280}px`,
        zIndex: 99999,
        display: 'block',
        minWidth: '280px',
        maxWidth: 'calc(100vw - 2rem)',
      });
    } else {
      // On desktop, center the tooltip horizontally beneath the anchor
      const tooltipWidth = 380;
      const leftPos =
        rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;

      setStyles({
        position: 'absolute',
        top: `${rect.bottom + window.scrollY + 8}px`,
        left: `${leftPos}px`,
        zIndex: 99999,
        display: 'block',
        width: `${tooltipWidth}px`,
      });
    }
  }, [open, anchorRef, mounted]);

  if (!mounted) {
    // If we’re on the server (or no document yet), don’t render anything
    return null;
  }

  // Render the tooltip into document.body so it won’t be clipped.
  return createPortal(
    <div
      className="ideas-tooltip bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-gray-700 text-sm"
      style={styles}
    >
      {open && children}
    </div>,
    document.body
  );
}

export default function ChatConversation() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // User data
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
  const [userServices, setUserServices] = useState<string[]>([]);
  const [userWebsite, setUserWebsite] = useState<string | null>(null);
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);

  // "Thinking" indicator
  const [isThinking, setIsThinking] = useState(false);

  // Track if we've already done the onboarding init call
  const [hasFiredOnboardingInit, setHasFiredOnboardingInit] = useState(false);

  // "Ideas" tooltip state
  const [showIdeas, setShowIdeas] = useState(false);
  const ideasRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastMessageTimestamp = useRef<number>(0);
  const THROTTLE_DELAY = 2000; // 2 seconds

  // Check if we came via onboarding
  const params = new URLSearchParams(location.search);
  const isOnboarding =
    params.get('source') === 'onboarding' && params.get('trigger') === 'auto';

  /**
   * Scroll to bottom whenever messages change
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Auto-resize textarea
   */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  /**
   * Fetch the current user's data from Supabase
   */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsUserDataLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsUserDataLoading(false);
          return;
        }

        setUserEmail(user.email);

        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url, display_name, services, website')
          .eq('id', user.id)
          .single();

        if (profile?.avatar_url) setUserAvatar(profile.avatar_url);
        if (profile?.display_name) setUserDisplayName(profile.display_name);
        if (profile?.services) setUserServices(profile.services);
        if (profile?.website) setUserWebsite(profile.website);
      } catch (error) {
        console.error('[ChatConversation Debug] Error fetching user data:', error);
      } finally {
        setIsUserDataLoading(false);
      }
    };

    fetchUserData();
  }, []);

  /**
   * One-time init if from onboarding
   */
  useEffect(() => {
    if (isUserDataLoading || hasFiredOnboardingInit) return;
    setHasFiredOnboardingInit(true);

    const initializeChat = async () => {
      try {
        if (isOnboarding && userEmail) {
          console.log('[ChatConversation Debug] Onboarding → sending "onboarding_init"');
          setIsThinking(true);

          const response = await sendChatMessage(
            'onboarding_init',
            userEmail,
            userDisplayName,
            userServices,
            userWebsite
          );

          setMessages([
            {
              content: response.response,
              isBot: true,
              timestamp: new Date(),
              status: 'sent',
            },
          ]);
        }
      } catch (error) {
        console.error('[ChatConversation Debug] Failed to initialize chat:', error);
      } finally {
        setIsThinking(false);
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
    hasFiredOnboardingInit,
  ]);

  /**
   * Throttled user message sending
   */
  const throttledSendMessage = useCallback(
    throttle(async (messageContent: string) => {
      if (!userEmail) return;

      const now = Date.now();
      if (now - lastMessageTimestamp.current < THROTTLE_DELAY) {
        console.log('[ChatConversation Debug] Message throttled - too soon');
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
          const updated = [...prev];
          // find the user's sending message to update its status
          const userMsgIndex = updated.findIndex(
            (m) => !m.isBot && m.status === 'sending'
          );
          if (userMsgIndex !== -1) {
            updated[userMsgIndex] = { ...updated[userMsgIndex], status: 'sent' };
          }
          return [
            ...updated,
            {
              content: response.response,
              isBot: true,
              timestamp: new Date(),
              status: 'sent',
            },
          ];
        });
      } catch (error: any) {
        console.error('[ChatConversation Debug] Error sending message:', error);
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
   * SHIFT+ENTER => new line
   * ENTER => send
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Cleanup throttling on unmount
   */
  useEffect(() => {
    return () => {
      throttledSendMessage.cancel();
    };
  }, [throttledSendMessage]);

  /**
   * Clicking outside the "Ideas" button closes the tooltip
   */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ideasRef.current && !ideasRef.current.contains(e.target as Node)) {
        setShowIdeas(false);
      }
    }
    if (showIdeas) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showIdeas]);

  /**
   * Prevent accidental back swipes (trackpads)
   */
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
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

  // OPTIONAL: enforce a 1000-char limit
  const maxChars = 1000;
  const charCount = message.length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hide scrollbars in this component */}
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>

      {/* 
        WRAP everything in a container so chat messages 
        align with the same column as the chat bubble. 
      */}
      <div className="mx-auto w-full max-w-2xl px-4">
        <div className="relative h-full w-full overflow-y-auto no-scrollbar">
          {/* If no messages, show the welcome header */}
          {messages.length === 0 && (
            <div className="text-center mt-4 space-y-2">
              {isOnboarding ? (
                <h1 className="text-4xl md:text-5xl font-bold">
                  <span>Welcome to the platform, </span>
                  <span className="bg-gradient-to-r from-[#0066FF] to-[#80D078] bg-clip-text text-transparent">
                    {userDisplayName || 'New User'}
                  </span>
                </h1>
              ) : (
                <h1 className="text-4xl md:text-5xl font-bold flex items-center justify-center gap-2">
                  <MessageSquare className="w-9 h-9 text-[#0066FF]" />
                  <span className="bg-gradient-to-r from-[#0066FF] to-[#80D078] bg-clip-text text-transparent">
                    Ask SpeakerDrive
                  </span>
                </h1>
              )}

              <div className="flex items-center justify-center gap-2 text-base md:text-lg text-gray-600">
                <span>What can I help you work on today?</span>
                <div
                  className="relative inline-flex items-center"
                  ref={ideasRef}
                >
                  <button
                    type="button"
                    onClick={() => {
                      console.log('[ChatConversation Debug] Toggling tooltip');
                      setShowIdeas((prev) => !prev);
                    }}
                    className="flex items-center text-base md:text-lg text-blue-600 underline"
                  >
                    <Lightbulb className="w-5 h-5 mr-1" />
                    Ideas
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Chat messages */}
          <div className="mt-6 mb-6 flex flex-col gap-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className="flex items-start gap-4 w-fit max-w-full"
              >
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
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt="User"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src =
                              'https://www.gravatar.com/avatar/default?d=mp&s=200';
                          }}
                        />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="prose prose-sm max-w-full sm:max-w-[600px] text-[17px] leading-relaxed text-gray-900 break-words whitespace-pre-wrap tracking-[-0.01em]">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  {msg.status === 'error' && msg.error && (
                    <div className="mt-2 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      <p>{msg.error}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* MOBILE CHAT INPUT (fixed) */}
          <div className="block md:hidden fixed bottom-4 left-4 right-4 px-4">
            <div className="bg-white rounded-3xl shadow-lg p-4">
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
                className="w-full min-h-[60px] resize-none text-sm placeholder-gray-400 focus:outline-none"
                disabled={isLoading || isUserDataLoading}
              />
              {/* Softer gradient divider */}
              <div className="mt-3 h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent" />
              <div className="mt-2 flex items-center justify-between">
                {/* Character counter + refresh icon */}
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400 px-3 py-1 bg-gray-50 rounded-md">
                    {charCount}/{maxChars}
                  </span>
                  <RotateCcw
                    onClick={() => setMessage('')}
                    className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                  />
                </div>
                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || isLoading}
                  className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
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

        {/* DESKTOP CHAT INPUT (pinned at bottom of window, centered) */}
        <div className="hidden md:block absolute bottom-20 inset-x-0 pointer-events-none z-50">
          <div className="mx-auto w-full max-w-2xl pointer-events-auto px-4">
            <div className="bg-white rounded-3xl shadow-lg p-4">
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
                className="w-full min-h-[100px] resize-none text-sm placeholder-gray-400 focus:outline-none"
                disabled={isLoading || isUserDataLoading}
              />
              {/* Softer gradient divider */}
              <div className="mt-3 h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent" />
              <div className="mt-2 flex items-center justify-between">
                {/* Character counter + refresh icon */}
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400 px-3 py-1 bg-gray-50 rounded-md">
                    {charCount}/{maxChars}
                  </span>
                  <RotateCcw
                    onClick={() => setMessage('')}
                    className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                  />
                </div>
                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || isLoading}
                  className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
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
      </div>

      {/* 
        The tooltip styles for a consistent look. 
        We rely on inline positioning from the Portal’s measurement logic.
      */}
      <style>
        {`
          .ideas-tooltip {
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1),
                        0 2px 4px -2px rgb(0 0 0 / 0.1);
            border-radius: 8px;
          }
        `}
      </style>

      {/* 
        Render the portal so the tooltip appears outside any overflow. 
        Toggling showIdeas triggers the Portal to appear.
      */}
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
