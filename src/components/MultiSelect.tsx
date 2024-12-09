import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  icon?: React.ElementType;
}

interface MultiSelectProps {
  label: string;
  helperText?: string;
  options: Option[];
  selected: string[];
  onChange: (value: string) => void;
  maxSelections?: number;
  disabled?: boolean;
  error?: string;
}

export default function MultiSelect({
  label,
  helperText,
  options,
  selected,
  onChange,
  maxSelections,
  disabled,
  error
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const canSelectMore = !maxSelections || selected.length < maxSelections;

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {maxSelections && (
          <span className="ml-2 text-sm font-normal text-gray-500">
            (Select up to {maxSelections})
          </span>
        )}
      </label>
      {helperText && (
        <p className="text-sm text-gray-500 mb-2">{helperText}</p>
      )}

      {/* Selected Tags */}
      <div className="mb-2 flex flex-wrap gap-2">
        {selected.map((id) => {
          const option = options.find(opt => opt.id === id);
          if (!option) return null;

          return (
            <span
              key={id}
              className="inline-flex items-center px-2.5 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {option.icon && <option.icon className="w-4 h-4 mr-1.5" />}
              {option.label}
              {!disabled && (
                <button
                  onClick={() => onChange(id)}
                  className="ml-1.5 hover:text-blue-900"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </span>
          );
        })}
      </div>

      {/* Dropdown Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          relative w-full bg-white py-2.5 pl-3 pr-10 text-left border rounded-lg shadow-sm
          ${disabled ? 'cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:bg-gray-50'}
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
        disabled={disabled}
      >
        <span className="block truncate text-sm text-gray-500">
          {canSelectMore ? 'Select options...' : `Maximum ${maxSelections} selected`}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-60 overflow-auto">
          {options.map((option) => {
            const isSelected = selected.includes(option.id);
            const isDisabled = !isSelected && !canSelectMore;

            return (
              <button
                key={option.id}
                onClick={() => {
                  if (!isDisabled) {
                    onChange(option.id);
                  }
                }}
                className={`
                  w-full text-left px-3 py-2 flex items-center justify-between
                  ${isSelected ? 'bg-blue-50 text-blue-900' : 'text-gray-900'}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                `}
                disabled={isDisabled}
              >
                <div className="flex items-center">
                  {option.icon && (
                    <option.icon className={`w-5 h-5 mr-3 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
                  )}
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
                {isSelected && <Check className="w-5 h-5 text-blue-500" />}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}