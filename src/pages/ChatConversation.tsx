import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => setIsSending(false), 1000);
  };

  // Character count animation setup
  const getCharCountColor = (length: number) => {
    if (length === 0) return '#64748B';
    if (length < 800) return '#00B341';
    if (length < 900) return '#FF9800';
    return '#FF5252';
  };

  return (
    <div style={{ background: '#EDEEF0' }} className="min-h-screen p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-2xl">
        {/* Header section remains the same */}
        <div className="mb-8">
          <h1 
            style={{
              background: 'linear-gradient(90deg, #0066FF, #00B341, #0066FF)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '1.5rem',
              animation: 'gradient 8s ease infinite'
            }}
            className="text-4xl font-bold"
          >
            Hey, Expert
          </h1>
          <p className="text-[#4B5563] text-lg mb-6 leading-relaxed">
            I'm here to help you add value to your clients and win more engagements.
          </p>
          <h2 className="text-xl font-bold text-black">
            What would you like to know?
          </h2>
        </div>

        <div 
          className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.08),0_8px_48px_rgba(0,0,0,0.04)] overflow-hidden transform-gpu"
          style={{
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div className="p-6 pb-8">
            <textarea
              className="w-full min-h-[100px] resize-none text-sm placeholder-gray-400 focus:outline-none"
              placeholder="Try asking: 'What strategies can help me win more client projects?'"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                // Trigger composing state for short duration
                setIsComposing(true);
                setTimeout(() => setIsComposing(false), 500);
              }}
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
                    color: getCharCountColor(message.length),
                    transform: isComposing ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  {message.length}/1000
                </span>
                <button 
                  onClick={handleSend}
                  style={{
                    background: '#0066FF',
                    transform: isSending ? 'scale(0.95)' : 'scale(1)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  className="text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#00B341]"
                >
                  <svg className={`w-4 h-4 transition-transform duration-300 ${isSending ? 'scale-110' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
};

export default ChatInterface;