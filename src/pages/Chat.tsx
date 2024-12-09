import React, { useState } from 'react';
import ChatHeader from '../components/chat/ChatHeader';
import ChatInput from '../components/chat/ChatInput';
import ChatMessage from '../components/chat/ChatMessage';
import PromptModal from '../components/intel/PromptModal';
import { prompts } from '../data/prompts';
import { LineChart, Building2, UserCircle2, Target } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isAi: boolean;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<typeof prompts[0] | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'alphabetical' | 'deepdives'>('popular');

  const categories = [
    { id: 'all', name: 'All Instant Intel', icon: LineChart, color: 'gray' },
    { id: 'industry', name: '    Industry Intel', icon: Building2, color: 'emerald' },
    { id: 'company', name: '    Company Intel', icon: Target, color: 'purple' },
    { id: 'role', name: '    Role Intel', icon: UserCircle2, color: 'blue' },
  ];

  const handleSendMessage = async (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isAi: false,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update message status to sent
    setMessages(prev => 
      prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
      )
    );

    // Add AI response
    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      content: 'This is a simulated AI response. In production, this would be replaced with the actual API response.',
      isAi: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiResponse]);
  };

  const handlePromptSubmit = (processedPrompt: string) => {
    handleSendMessage(processedPrompt);
  };

  const filteredPrompts = prompts
    .filter(prompt => {
      if (activeCategory === 'all') return true;
      return prompt.category === activeCategory;
    })
    .filter(prompt => {
      if (!searchTerm) return true;
      return (
        prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.placeholder.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .filter(prompt => {
      if (sortBy === 'deepdives') {
        return prompt.id.includes('deepdive');
      }
      if (sortBy === 'popular') {
        return !prompt.id.includes('deepdive');
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.promptText.localeCompare(b.promptText);
      }
      return a.popularity - b.popularity;
    });

  return (
    <div className="flex flex-col h-screen bg-white">
      <ChatHeader 
        title="Instant Intel"
        subtitle="Get instant, actionable insights"
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 border-r border-gray-100">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Categories
            </h2>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`
                    w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-colors
                    ${activeCategory === category.id
                      ? category.id === 'industry' ? 'bg-emerald-50 text-emerald-700' :
                        category.id === 'company' ? 'bg-purple-50 text-purple-700' :
                        category.id === 'role' ? 'bg-blue-50 text-blue-700' :
                        'bg-gray-50 text-gray-700'
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <category.icon className={`
                    w-5 h-5 mr-3
                    ${activeCategory === category.id
                      ? category.id === 'industry' ? 'text-emerald-600' :
                        category.id === 'company' ? 'text-purple-600' :
                        category.id === 'role' ? 'text-blue-600' :
                        'text-gray-600'
                      : 'text-gray-500'
                    }
                  `} />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Instant Intel
              </h1>
              <p className="text-gray-500">
                Select a prompt to generate custom intel.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-gray-200 bg-white p-1">
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      sortBy === 'popular'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Popular
                  </button>
                  <button
                    onClick={() => setSortBy('deepdives')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      sortBy === 'deepdives'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Deep Dives
                  </button>
                  <button
                    onClick={() => setSortBy('alphabetical')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      sortBy === 'alphabetical'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    A-Z
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  onClick={() => setSelectedPrompt(prompt)}
                  className="group bg-white rounded-lg border border-gray-200 hover:border-gray-300 p-4 cursor-pointer transition-all duration-200 hover:shadow-sm relative"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg ${prompt.iconBg} flex items-center justify-center`}>
                      <prompt.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          prompt.category === 'industry' ? 'bg-emerald-100 text-emerald-700' :
                          prompt.category === 'company' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {prompt.category === 'industry' ? 'Industry Intel' :
                           prompt.category === 'company' ? 'Company Intel' :
                           'Role Intel'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {prompt.promptText.split('{placeholder}')[0]}
                            <span className="inline-block bg-gray-100 border border-gray-200 text-gray-700 px-4 py-0.5 rounded-xl">
                              {prompt.placeholder}
                            </span>
                            {prompt.promptText.split('{placeholder}')[1]}
                          </div>
                          <div className="mt-1 text-xs font-medium text-gray-400 group-hover:text-blue-500 transition-colors">
                            Click to try this prompt →
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedPrompt && (
        <PromptModal
          prompt={selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
          onSubmit={handlePromptSubmit}
        />
      )}

      {messages.length > 0 && (
        <div className="border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                content={message.content}
                isAi={message.isAi}
                timestamp={message.timestamp}
                status={message.status}
              />
            ))}
          </div>
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      )}
    </div>
  );
}