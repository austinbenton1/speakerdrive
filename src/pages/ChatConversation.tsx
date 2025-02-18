import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { sendChatMessage } from '../lib/api/chatbot';
import { supabase } from '../lib/supabase';
import { Loader2, AlertCircle, User } from 'lucide-react';
import { throttle } from 'lodash';
import ReactMarkdown from 'react-markdown';

interface Message {
  content: string;
  role: 'user' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  error?: string;
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

  // For showing a "thinking" indicator
  const [isThinking, setIsThinking] = useState(false);

  // **NEW**: Keep track if we've already done the onboarding init call
  const [hasFiredOnboardingInit, setHasFiredOnboardingInit] = useState(false);

  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastMessageTimestamp = useRef<number>(0);
  const THROTTLE_DELAY = 2000; // 2 seconds

  /**
   * If we landed here via Onboarding (source=onboarding&trigger=auto),
   * we want to send "onboarding_init" exactly once.
   */
  const params = new URLSearchParams(location.search);
  const isOnboarding = params.get('source') === 'onboarding' && params.get('trigger') === 'auto';

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
          data: { user }
        } = await supabase.auth.getUser();

        if (!user) {
          // Possibly redirect if no user
          setIsUserDataLoading(false);
          return;
        }

        setUserEmail(user.email);

        // Grab additional data from 'profiles'
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
   * Once user data is loaded, do a one‐time init if from onboarding.
   */
  useEffect(() => {
    // If user data is still loading, or we've already run the onboarding init, skip
    if (isUserDataLoading || hasFiredOnboardingInit) return;

    // We only do the onboarding init once in this component’s lifecycle
    setHasFiredOnboardingInit(true);

    const initializeChat = async () => {
      try {
        // Are we coming from onboarding?
        if (isOnboarding && userEmail) {
          console.log('[ChatConversation Debug] Onboarding → sending "onboarding_init" to /ai-data');
          setIsThinking(true);

          const response = await sendChatMessage(
            'onboarding_init',
            userEmail,
            userDisplayName,
            userServices,
            userWebsite
          );

          // Show the AI response
          setMessages([
            {
              content: response.response,
              role: 'bot',
              timestamp: new Date(),
              status: 'sent',
            },
          ]);
        } else {
          // Normal chat visit (optional):
          // console.log('[ChatConversation Debug] Normal chat visit - no auto message');
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
    hasFiredOnboardingInit
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

        // Mark user message as 'sent' & add AI response
        setMessages((prev) => {
          // Update the last user message from "sending" → "sent"
          const updated = [...prev];
          const userMsgIndex = updated.findIndex((m) => m.role === 'user' && m.status === 'sending');
          if (userMsgIndex !== -1) {
            updated[userMsgIndex] = { ...updated[userMsgIndex], status: 'sent' };
          }
          return [
            ...updated,
            {
              content: response.response,
              role: 'bot',
              timestamp: new Date(),
              status: 'sent',
            },
          ];
        });
      } catch (error: any) {
        console.error('[ChatConversation Debug] Error sending message:', error);
        setMessages((prev) => {
          const updated = [...prev];
          const userMsgIndex = updated.findIndex((m) => m.role === 'user' && m.status === 'sending');
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
      role: 'user',
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, userMsg]);

    setMessage('');
    setIsLoading(true);

    // Throttled call
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

  // Cleanup throttling on unmount
  useEffect(() => {
    return () => {
      throttledSendMessage.cancel();
    };
  }, [throttledSendMessage]);

  if (isUserDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#EDEEF0' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-600">Initializing chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-2xl flex flex-col">
        {/* Main Content Area */}
        <div className="flex flex-col flex-grow">
          {/* Header */}
          <div className="flex-shrink-0 mb-4">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight text-center">
              <span className="bg-gradient-to-r from-[#0066FF] to-[#00B341] bg-clip-text text-transparent">
                Ask SpeakerDrive
              </span>
            </h1>
          </div>

          {/* Settings Warning */}
          {messages.length === 0 && (
            <div className="settings-link block lg:hidden bg-orange-50 border-y border-orange-100 flex-shrink-0 mb-4">
              <div className="text-[9px] text-orange-700 flex items-center justify-center gap-1.5 px-2 py-0.5">
                <svg 
                  className="w-2.5 h-2.5 text-orange-700 flex-shrink-0"
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-center">
                  Update your <a href="/settings/profile" className="text-inherit">settings</a> to keep our conversations tailored to you
                </span>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="chat-messages-container">
            <div className="flex flex-col gap-6 overflow-y-auto px-2">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-4 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="flex-shrink-0">
                      {msg.role === 'user' ? (
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          <User className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <img src="/logo.svg" alt="SpeakerDrive" className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`prose prose-sm max-w-[600px] text-[15px] leading-relaxed text-gray-900 break-words font-[400] tracking-[-0.01em] whitespace-pre-wrap ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      {msg.status === 'error' && msg.error && (
                        <div className="mt-2 text-red-500 text-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {msg.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Thinking indicator */}
          {isThinking && (
            <div className="flex items-start gap-4 w-fit max-w-full mb-6">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                  <img
                    src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/TT6h28gNIZXvItU0Dzmk/media/67180e69632642282678b099.png"
                    alt="AI"
                    className="w-7 h-7"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 px-4 py-2 bg-gray-100 rounded-lg">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Message input */}
          <div className="relative flex-shrink-0">
            <div className="flex flex-col">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Compose your message..."
                className="w-full h-[70px] p-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="absolute bottom-3 left-3 flex items-center gap-3 text-gray-400">
                <button className="hover:text-gray-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-3.646 5.854a.5.5 0 00.792.001l.647-.902a.75.75 0 00-.156-1.048 4.002 4.002 0 00-4.682 0 .75.75 0 00-.156 1.048l.647.902a.5.5 0 00.792-.001z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="hover:text-gray-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a3 3 0 00-3-3H8zm6 7a3 3 0 01-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a1 1 0 012 0v4z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <button 
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#64748B] text-xs mt-8 pl-2">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <a href="/settings" className="underline hover:text-[#00B341] transition-colors">
              Update your settings
            </a>
            <span className="text-[#64748B]">to keep our conversations tailored to you</span>
          </div>
        </div>
      </div>
    </div>
  );
}
