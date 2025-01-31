import React, { useState, useRef, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { PaperclipIcon, Image, Send } from 'lucide-react';

const MAX_CHARS = 4000; // Increased to handle longer messages

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  className?: string;
}

export default function ChatInput({ onSendMessage, isLoading, className = '' }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (input.trim() && !isLoading && input.length <= MAX_CHARS) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`border-t border-gray-200 bg-white ${className}`}>
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex flex-col">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask whatever you want..."
              rows={3}
              disabled={isLoading}
              className="w-full resize-none rounded-xl border border-gray-200 bg-white p-4 pl-4 pr-20 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 sm:text-sm disabled:opacity-50"
            />
            <div className="absolute right-2 bottom-2 flex items-center space-x-2 py-2 pr-2">
              <button 
                className="p-1.5 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                disabled={isLoading}
              >
                <PaperclipIcon className="w-5 h-5" />
              </button>
              <button 
                className="p-1.5 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                disabled={isLoading}
              >
                <Image className="w-5 h-5" />
              </button>
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading || input.length > MAX_CHARS}
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-[#0066FF] text-white hover:bg-[#0052CC]"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 px-2 text-xs">
            <span className={input.length > MAX_CHARS ? 'text-red-500' : 'text-gray-400'}>
              {input.length}/{MAX_CHARS}
              {input.length > MAX_CHARS && (
                <span className="ml-2">
                  Message too long by {input.length - MAX_CHARS} characters
                </span>
              )}
            </span>
            <span className="text-gray-400">All Web</span>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>
            <RouterLink to="/settings" className="text-gray-600 hover:text-gray-900 underline underline-offset-2">
              Update your settings
            </RouterLink>
            {' '}to keep our conversations tailored and impactful.
          </p>
        </div>
      </div>
    </div>
  );
}