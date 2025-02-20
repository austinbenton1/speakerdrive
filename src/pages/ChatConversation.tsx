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
        top: `${rect.bottom + window.scrollY + 8}px`,
        left: `${rect.right + window.scrollX - 280}px`,
        zIndex: 99999,
        display: 'block',
        minWidth: '280px',
        maxWidth: 'calc(100vw - 2rem)',
      });
    } else {
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

  if (!mounted) return null;

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
  const [hasFiredOnboardingInit, setHasFiredOnboardingInit] = useState(false);

  // Tooltip
  const [showIdeas, setShowIdeas] = useState(false);
  const ideasRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // For scrolling + text area
  const messagesWrapperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Throttle
  const lastMessageTimestamp = useRef<number>(0);
  const THROTTLE_DELAY = 2000;

  // Check if from onboarding
  const isOnboarding =
    params.get('source') === 'onboarding' && params.get('trigger') === 'auto';

  /**
   * Fetch user data from Supabase
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
        console.error('[ChatConversation] Error fetching user data:', error);
      } finally {
        setIsUserDataLoading(false);
      }
    };

    fetchUserData();
  }, []);

  /**
   * One-time onboarding init
   */
  useEffect(() => {
    if (isUserDataLoading || hasFiredOnboardingInit) return;
    setHasFiredOnboardingInit(true);

    const initializeChat = async () => {
      if (isOnboarding && userEmail) {
        try {
          console.log('[ChatConversation] Onboarding → sending "onboarding_init"');
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
   * Auto-scroll so new messages appear above the bubble
   */
  useEffect(() => {
    if (!messagesWrapperRef.current) return;
    const container = messagesWrapperRef.current;
    // The bubble offset: how many px from the bottom we want to "spare"
    const bubbleOffset = 720;
    container.scrollTo({
      top: container.scrollHeight - bubbleOffset,
      behavior: 'smooth',
    });
  }, [messages]);

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

  const scrollToBottom = useCallback(() => {
    if (messagesWrapperRef.current) {
      const scrollContainer = messagesWrapperRef.current.closest('.overflow-auto');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, []);

  // Auto-scroll when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, scrollToBottom]);

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
          <div 
            ref={messagesWrapperRef}
            className="space-y-4 py-4"
          >
            {/* If no messages, show welcome */}
            {messages.length === 0 && (
              <div className="text-center space-y-2">
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
                  <div className="relative inline-flex items-center" ref={ideasRef}>
                    <button
                      type="button"
                      onClick={() => setShowIdeas((prev) => !prev)}
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
                <div key={index} className={`flex items-start gap-4 w-fit max-w-full ${!msg.isBot ? 'ml-auto flex-row-reverse' : ''}`}>
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

                  {/* Message content */}
                  <div className="flex-1 min-w-0">
                    <div className={`prose prose-sm max-w-full sm:max-w-[600px] text-[17px] leading-relaxed break-words whitespace-pre-wrap tracking-[-0.01em] p-4 rounded-2xl ${
                      msg.isBot 
                        ? 'text-gray-800 bg-gray-100 border border-gray-300'
                        : 'text-blue-800 bg-blue-100'
                    }`}>
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
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING BUBBLE ~ 25% from bottom */}
      <div className="sticky left-0 right-0 z-50">
        <div className="mx-auto w-full max-w-2xl px-4">
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
              className="w-full min-h-[80px] resize-none text-base sm:text-sm placeholder-gray-400 focus:outline-none"
              disabled={isLoading || isUserDataLoading}
            />
            <div className="mt-4 flex items-center justify-between">
              {/* character counter + reset */}
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
