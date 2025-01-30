import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { sendChatMessage } from '../lib/api/chatbot';
import { supabase } from '../lib/supabase';
import { Loader2, AlertCircle, PaperclipIcon, Image, Send, Mail, Zap, User } from 'lucide-react';

interface Message {
  content: string;
  isBot: boolean;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  error?: string;
}

const WELCOME_MESSAGE_KEY = 'welcome_message_shown';

export default function ChatConversation() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Fetch user avatar
  useEffect(() => {
    const fetchUserAvatar = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        setUserEmail(user.email);

        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();

        if (profile?.avatar_url) {
          setUserAvatar(profile.avatar_url);
        }
      } catch (error) {
        console.error('Error fetching user avatar:', error);
      }
    };

    fetchUserAvatar();
  }, []);

  // Handle onboarding welcome message
  useEffect(() => {
    let mounted = true;

    const initializeChat = async () => {
      try {
        // Check if welcome message was already shown
        const welcomeShown = sessionStorage.getItem(WELCOME_MESSAGE_KEY);
        if (welcomeShown) {
          setIsInitializing(false);
          return;
        }

        // Check URL parameters
        const searchParams = new URLSearchParams(location.search);
        const isOnboarding = searchParams.get('source') === 'onboarding';
        const shouldAutoTrigger = searchParams.get('trigger') === 'auto';

        if (!isOnboarding || !shouldAutoTrigger) {
          setIsInitializing(false);
          return;
        }

        // Check user creation time
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error('Error getting user:', userError);
          setIsInitializing(false);
          return;
        }

        const createdAt = new Date(user.created_at);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        // Only proceed if user was created in the last 5 minutes
        if (createdAt < fiveMinutesAgo) {
          setIsInitializing(false);
          return;
        }

        // Send welcome message
        console.log('Sending welcome message...');
        const response = await sendChatMessage('onboarding_init');
        console.log('Welcome message response:', response);
        
        if (mounted) {
          if (response && response.response) {
            setMessages([{
              content: response.response,
              isBot: true,
              timestamp: new Date(),
              status: 'sent'
            }]);

            // Mark welcome message as shown
            sessionStorage.setItem(WELCOME_MESSAGE_KEY, 'true');
          } else {
            throw new Error('Invalid response from chatbot');
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        if (mounted) {
          // Don't set error message in messages array - just skip initialization
          console.log('Skipping initialization due to error');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsInitializing(false);
        }
      }
    };

    initializeChat();

    return () => {
      mounted = false;
    };
  }, [location.search]);

  const handleSend = async () => {
    if (!message.trim() || isLoading || !userEmail) return;

    const userMessage = {
      content: message.trim(),
      isBot: false,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(message.trim(), userEmail);
      
      // Update user message status
      setMessages(prev => prev.map(msg => 
        msg === userMessage ? { ...msg, status: 'sent' } : msg
      ));

      // Add bot response
      setMessages(prev => [...prev, {
        content: response.response,
        isBot: true,
        timestamp: new Date(),
        status: 'sent'
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Update user message status to error
      setMessages(prev => prev.map(msg => 
        msg === userMessage ? { 
          ...msg, 
          status: 'error',
          error: error instanceof Error ? error.message : 'Failed to send message'
        } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isInitializing) {
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
      <div className="w-full max-w-2xl">
        {/* Welcome Section */}
        {messages.length === 0 && (
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-[#0066FF] to-[#00B341] bg-clip-text text-transparent">
                Ask SpeakerDrive
              </span>
            </h1>
          </div>
        )}

        {/* Messages Section */}
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
                          target.src = 'https://www.gravatar.com/avatar/default?d=mp&s=200';
                        }}
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="prose prose-sm max-w-[600px] text-[17px] leading-relaxed text-gray-900 break-words font-[450] tracking-[-0.01em]">{msg.content}</div>
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

        {/* Input Section */}
        <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.08),0_8px_48px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="p-6 pb-8">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Try asking: 'What strategies can help me win more client projects?'"
              className="w-full min-h-[100px] resize-none text-sm placeholder-gray-400 focus:outline-none"
              disabled={isLoading}
            />
          </div>
          
          <div className="border-t border-gray-100">
            <div className="px-6 py-3 flex justify-between items-center">
              <div className="flex gap-8">
                <button className="flex items-center gap-2 text-[#64748B] hover:text-[#00B341] transition-all duration-300 group text-sm">
                  <span style={{ color: '#00B341' }} 
                        className="text-xl group-hover:scale-110 transition-transform">+</span>
                  <span className="relative">
                    Add Attachment
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00B341] group-hover:w-full transition-all duration-300"/>
                  </span>
                </button>
                <button className="flex items-center gap-2 text-[#64748B] hover:text-[#00B341] transition-all duration-300 group text-sm">
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="#00B341" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22,4 -10,9 -10,-9"/>
                  </svg>
                  <span className="relative">
                    Email Transcript
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00B341] group-hover:w-full transition-all duration-300"/>
                  </span>
                </button>
              </div>
              
              <div className="flex items-center gap-4">
                <span 
                  className="transition-colors duration-300"
                  style={{ 
                    color: message.length === 0 ? '#64748B' :
                           message.length < 800 ? '#00B341' :
                           message.length < 900 ? '#FF9800' : '#FF5252'
                  }}
                >
                  {message.length}/1000
                </span>
                <button 
                  onClick={handleSend}
                  disabled={!message.trim() || isLoading}
                  className={`
                    text-white w-8 h-8 rounded-lg flex items-center justify-center
                    transition-all duration-200
                    ${isLoading || !message.trim()
                      ? 'bg-blue-400 cursor-not-allowed scale-95'
                      : 'bg-[#0066FF] hover:bg-[#00B341] scale-100'
                    }
                  `}
                >
                  <svg className="w-4 h-4 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14m-5-5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[#64748B] text-xs mt-8 pl-2">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <Link to="/settings" className="underline hover:text-[#00B341] transition-colors">
            Update your settings
          </Link>
          <span className="text-[#64748B]">
            to keep our conversations tailored to you
          </span>
        </div>
      </div>
    </div>
  );
}