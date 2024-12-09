import React from 'react';
import { Check } from 'lucide-react';

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (value: string) => void;
}

export default function MultiSelect({ options, selected, onChange }: MultiSelectProps) {
  return (
    <div className="space-y-1">
      {options.map((option) => (
        <label
          key={option}
          className={`
            flex items-center w-full px-3 py-2 rounded-md cursor-pointer
            ${selected.includes(option)
              ? 'bg-gray-100 text-gray-900'
              : 'hover:bg-gray-50 text-gray-700'
            }
          `}
        >
          <div className="flex-1 flex items-center">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onChange(option)}
              className="h-4 w-4 text-gray-600 rounded border-gray-300 focus:ring-gray-500"
            />
            <span className="ml-3 text-sm">{option}</span>
          </div>
          {selected.includes(option) && (
            <Check className="w-4 h-4 text-gray-500 ml-2" />
          )}
        </label>
      ))}
    </div>
  );
}