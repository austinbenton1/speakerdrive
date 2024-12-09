import React from 'react';
import { Check, Lightbulb } from 'lucide-react';

interface QuickStartGuideProps {
  onDismiss: () => void;
}

export default function QuickStartGuide({ onDismiss }: QuickStartGuideProps) {
  const brandColors = {
    blue: '#0066FF',
    green: '#00B341'
  };

  return (
    <div className="max-w-3xl mb-4">
      <div 
        className="bg-white rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-200/75 p-3.5 flex items-center justify-between relative overflow-hidden"
      >
        {/* Green accent border */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00B341]" />
        
        {/* Content */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#00B341]/[0.08] flex items-center justify-center flex-shrink-0">
            <Lightbulb 
              className="h-4.5 w-4.5"
              style={{ color: brandColors.green }}
            />
          </div>
          <div>
            <div className="font-medium text-gray-900 text-sm">Quick Start Guide</div>
            <div className="text-gray-600 text-xs mt-0.5">
              Choose one or more industries below. Optional filters on the left help narrow your results.
            </div>
          </div>
        </div>

        {/* Button */}
        <button 
          onClick={onDismiss}
          className="ml-4 px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1.5 hover:opacity-90 flex-shrink-0 shadow-sm hover:shadow"
          style={{ 
            backgroundColor: brandColors.blue,
            color: 'white'
          }}
        >
          <span>Got it</span>
          <Check className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}