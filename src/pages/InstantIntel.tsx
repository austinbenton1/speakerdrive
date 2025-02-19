import React, { useState } from 'react';
import { LineChart, Building2, Target, UserCircle2 } from 'lucide-react';
import { prompts } from '../data/prompts';
import PromptModal from '../components/intel/PromptModal';

export default function InstantIntel() {
  const [selectedPrompt, setSelectedPrompt] = useState<typeof prompts[0] | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Instant Intel', icon: LineChart, color: 'gray' },
    { id: 'industry', name: 'Industry Intel', icon: Building2, color: 'emerald' },
    { id: 'company', name: 'Company Intel', icon: Target, color: 'purple' },
    { id: 'role', name: 'Role Intel', icon: UserCircle2, color: 'blue' },
  ];

  // Reorder prompts to put deep dives in positions 4-6
  const orderedPrompts = [...prompts].sort((a, b) => {
    const aIsDeepDive = a.id.includes('deepdive');
    const bIsDeepDive = b.id.includes('deepdive');

    if (aIsDeepDive && !bIsDeepDive) {
      const aIndex = prompts.findIndex(p => p.id === a.id);
      if (aIndex < 3) return -1;
      return 1;
    }
    if (!aIsDeepDive && bIsDeepDive) {
      const bIndex = prompts.findIndex(p => p.id === b.id);
      if (bIndex < 3) return 1;
      return -1;
    }
    return a.popularity - b.popularity;
  });

  const filteredPrompts = orderedPrompts.filter(prompt => {
    if (activeCategory === 'all') return true;
    return prompt.category === activeCategory;
  });

  return (
    <div style={{ background: '#EDEEF0' }} className="min-h-screen p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-2xl">
        {/* Header section */}
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
            Instant Intel
          </h1>
          <p className="text-[#4B5563] text-lg mb-6 leading-relaxed">
            Get instant, actionable insights to help you win more speaking opportunities.
          </p>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
          <div className="flex rounded-lg border border-gray-200 bg-white p-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex-1
                  ${activeCategory === category.id
                    ? category.id === 'industry' ? 'bg-emerald-500 text-white' :
                      category.id === 'company' ? 'bg-purple-500 text-white' :
                      category.id === 'role' ? 'bg-blue-500 text-white' :
                      'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Prompts Grid */}
        <div className="space-y-4">
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              onClick={() => setSelectedPrompt(prompt)}
              className="group bg-white rounded-xl p-4 cursor-pointer transition-all duration-200 shadow-[0_4px_24px_rgba(0,0,0,0.08),0_8px_48px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.12),0_8px_48px_rgba(0,0,0,0.08)] transform-gpu hover:scale-[1.02]"
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

      {selectedPrompt && (
        <PromptModal
          prompt={selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
        />
      )}
    </div>
  );
}