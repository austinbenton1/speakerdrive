import React, { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (value: string) => void;
}

export default function MultiSelect({ options, selected, onChange }: MultiSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const inputs = containerRef.current.querySelectorAll('input[type="checkbox"]');
        const currentIndex = Array.from(inputs).indexOf(document.activeElement as HTMLElement);
        const nextIndex = e.key === 'ArrowDown' 
          ? (currentIndex + 1) % inputs.length
          : (currentIndex - 1 + inputs.length) % inputs.length;
        (inputs[nextIndex] as HTMLElement).focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div ref={containerRef} className="space-y-1">
      {options.map((option) => (
        <label
          key={option}
          className={`
            flex items-center justify-between w-full px-3 py-2 rounded-md cursor-pointer
            transition-all duration-200 group
            ${selected.includes(option)
              ? 'bg-white shadow-sm border border-gray-200 text-gray-900'
              : 'text-gray-600 hover:bg-white hover:text-gray-900'
            }
          `}
        >
          <div className="flex items-center min-w-0">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onChange(option)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40
                transition-colors"
            />
            <span className="ml-3 text-sm font-medium truncate">
              {option}
            </span>
          </div>
          {selected.includes(option) && (
            <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
          )}
        </label>
      ))}
    </div>
  );
}