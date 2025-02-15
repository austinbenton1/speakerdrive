import React, { useState } from 'react';
import { Bold, Italic, List } from 'lucide-react';

interface AboutMeProps {
  value: string;
  onChange: (value: string) => void;
  isEditing?: boolean;
  disabled?: boolean;
}

const CHAR_LIMIT = 1000;

export default function AboutMe({
  value,
  onChange,
  isEditing = false,
  disabled = false
}: AboutMeProps) {
  const [localValue, setLocalValue] = useState(value || '');

  // Format text for display by preserving line breaks
  const formatDisplayText = (text: string): string => {
    if (!text) return 'Click to add your professional bio...';
    
    return text
      .split('\n')
      .map(line => line.trim())
      .join('\n');
  };

  if (!isEditing) {
    return (
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">
          Professional Bio
          <span className="ml-2 text-sm font-normal text-gray-500">
            (Optional)
          </span>
        </h3>
        <div className={`
          w-full p-4 border rounded-lg bg-white
          ${disabled ? 'cursor-not-allowed opacity-75' : 'cursor-text'}
        `}>
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed min-h-[100px]">
            {formatDisplayText(value)}
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">
          Professional Bio
          <span className="ml-2 text-sm font-normal text-gray-500">
            (Optional)
          </span>
        </h3>
      </div>

      <div className="relative">
        {/* Formatting Tips */}
        <div className="mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 bg-white rounded">
              <Bold className="w-3.5 h-3.5 text-gray-600" />
            </div>
            <span className="text-sm text-gray-700 font-medium">Formatting Tips</span>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-gray-400" />
              <span>Press Enter twice to start a new paragraph</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-gray-400" />
              <span>Use • or - at the start of a line for bullet points</span>
            </div>
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            value={localValue}
            onChange={handleChange}
            disabled={disabled}
            placeholder="Award-winning keynote speaker specializing in leadership and transformation..."
            className={`
              w-full min-h-[300px] p-4 border rounded-lg resize-none
              text-base leading-relaxed
              ${disabled 
                ? 'bg-gray-50 cursor-not-allowed opacity-75' 
                : 'bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }
            `}
          />
          <div className={`
            absolute bottom-2 right-2 text-xs font-medium transition-colors
            ${localValue.length > 900 ? 'text-red-500' : localValue.length > 800 ? 'text-yellow-500' : 'text-gray-400'}
          `}>
            {localValue.length}/{CHAR_LIMIT}
          </div>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        <p>Suggested sections:</p>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-[11px]">
          <li>Areas of expertise</li>
          <li>Speaking experience</li>
          <li>Target audience</li>
          <li>Key achievements</li>
        </ul>
      </div>
    </div>
  );
}