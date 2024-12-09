import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Zap, Loader } from 'lucide-react';
import type { Prompt } from '../../types/intel';

interface PromptModalProps {
  prompt: Prompt;
  onClose: () => void;
}

export default function PromptModal({ prompt, onClose }: PromptModalProps) {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async () => {
    if (!input.trim() || status === 'loading' || status === 'success') return;

    setStatus('loading');
    try {
      // Replace the placeholder with the actual input
      const processedPrompt = prompt.prompt.replace(`[${prompt.placeholder}]`, input.trim());
      
      // Simulate a brief loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus('success');
      
      // Wait briefly to show success state, then navigate
      setTimeout(() => {
        navigate('/chat/conversation', { 
          state: { initialPrompt: processedPrompt },
          replace: true
        });
      }, 500);
    } catch (error) {
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
      }, 2000);
    }
  };

  const getPlaceholder = () => {
    const placeholders = {
      company: 'e.g. Microsoft, Apple, Meta...',
      industry: 'e.g. Healthcare, Fintech, E-commerce...',
      role: 'e.g. CTO, Sales Director, Product Manager...',
    };
    return placeholders[prompt.placeholder as keyof typeof placeholders] || `Enter ${prompt.placeholder}`;
  };

  const getHelperText = () => {
    const texts = {
      industry: 'Enter any Industry. Responses will focus on how you can add value and win more opportunities.',
      company: 'Enter any Company. Responses will focus on how you can add value and win more opportunities.',
      role: 'Enter any Role. Responses will focus on how you can add value and win more opportunities.',
    };
    return texts[prompt.placeholder as keyof typeof texts] || `Enter ${prompt.placeholder}`;
  };

  const buttonStates = {
    idle: {
      text: 'Generate',
      className: 'bg-blue-600 hover:bg-blue-700',
      icon: <Zap className="w-4 h-4" />,
    },
    loading: {
      text: 'Generating...',
      className: 'bg-blue-600 opacity-90 cursor-not-allowed',
      icon: <Loader className="w-4 h-4 animate-spin" />,
    },
    success: {
      text: 'Success!',
      className: 'bg-green-500 hover:bg-green-600',
      icon: <Zap className="w-4 h-4" />,
    },
    error: {
      text: 'Error - Try Again',
      className: 'bg-red-500 hover:bg-red-600',
      icon: <Zap className="w-4 h-4" />,
    },
  };

  const currentState = buttonStates[status];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <div className={`w-10 h-10 rounded-lg ${prompt.iconBg} flex items-center justify-center`}>
            <prompt.icon className="w-5 h-5 text-white" />
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="text-lg mb-1 font-medium text-gray-900">
            {prompt.promptText.split('{placeholder}')[0]}
            <span className="inline-block bg-gray-100 border border-gray-200 text-gray-700 px-4 py-0.5 rounded-xl">
              {prompt.placeholder}
            </span>
            {prompt.promptText.split('{placeholder}')[1]}
          </div>
          <div className="space-y-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={getPlaceholder()}
              disabled={status === 'loading' || status === 'success'}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-75"
            />
            <div className="text-xs text-gray-500">
              💡 {getHelperText()}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={status === 'loading' || status === 'success'}
            className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || status === 'loading' || status === 'success'}
            className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 transition-all duration-200 ${currentState.className} disabled:opacity-50`}
          >
            {currentState.text}
            {currentState.icon}
          </button>
        </div>
      </div>
    </div>
  );
}