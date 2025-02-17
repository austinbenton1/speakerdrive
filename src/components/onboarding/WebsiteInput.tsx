// /home/project/src/components/onboarding/WebsiteInput.tsx

import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Check, Globe } from 'lucide-react';
import { isValidUrl } from '../../utils/validation';

interface WebsiteInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  profile_url_type: 'website' | 'bureau' | 'company' | 'other';
  // We are no longer showing a separate error text. The main Onboarding page handles the single error message.
  error?: string;
  disabled?: boolean;
}

export default function WebsiteInput({
  value,
  onChange,
  profile_url_type,
  error,
  disabled = false,
}: WebsiteInputProps) {
  // Show/hide the “Don’t have one?” tooltip
  const [showTooltip, setShowTooltip] = useState(false);

  // Ref to the container so we can do "click outside to close"
  const containerRef = useRef<HTMLDivElement>(null);

  // If user clicks outside container, hide tooltip
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Tab' || e.key === 'Escape') {
        // Hide tooltip on tab or escape
        setShowTooltip(false);
      }
    }

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showTooltip]);

  // For user input, strip out "https://www." so they see just the domain
  const displayValue = value.replace(/^https?:\/\/(www\.)?/, '');

  // Re‐add the prefix on change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    let newValue = e.target.value.replace(/^https?:\/\/(www\.)?/, '');
    if (newValue.trim()) {
      newValue = `https://www.${newValue}`;
    } else {
      newValue = '';
    }
    onChange({
      ...e,
      target: { ...e.target, value: newValue },
    });
  };

  // Show validation icons if there's any input
  const showValidation = displayValue.trim().length > 0 || value.trim().length > 0;
  const isValid = value ? isValidUrl(value) : false;

  return (
    <div ref={containerRef} className="relative">
      {/* Label row */}
      <div className="flex items-center gap-2 flex-wrap mb-2 text-sm relative">
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="text-gray-700">Your personal brand website</span>

        {/* "Don't have one?" link */}
        <button
          type="button"
          className="text-blue-600 hover:underline focus:outline-none"
          onClick={() => setShowTooltip(!showTooltip)}
        >
          Don&apos;t have one?
        </button>

        {/* Tooltip, if showTooltip == true */}
        {showTooltip && (
          <div
            className="absolute bottom-full left-0 mb-2 w-72 p-4 rounded shadow-lg border border-gray-200 bg-white text-gray-800 text-sm z-20"
            style={{ lineHeight: '1.4' }}
          >
            Don’t have a personal website? Then add any webpage that features you
            (company page, news article, etc.) to help personalize your account.
          </div>
        )}
      </div>

      {/* Actual input field with forced prefix */}
      <div className="relative transition-all duration-200">
        <div
          className={`
            flex items-center w-full rounded-lg border shadow-sm bg-white overflow-hidden
            transition-all duration-200
            ${
              disabled
                ? 'bg-gray-50/75 border-gray-200'
                : showValidation && !isValid
                ? 'border-red-400'
                : 'border-gray-200 hover:border-gray-300'
            }
          `}
        >
          {/* prefix label */}
          <div className="flex items-center h-10 bg-gray-50 border-r border-gray-200 px-3">
            <span
              className={`
                text-sm font-medium
                ${disabled ? 'text-gray-400' : 'text-gray-500'}
              `}
            >
              https://www.
            </span>
          </div>

          <input
            type="text"
            value={displayValue}
            onChange={handleChange}
            disabled={disabled}
            placeholder="example.com"
            className={`
              flex-1 w-full h-10 pl-3 pr-3
              text-sm bg-transparent
              placeholder:text-gray-400
              focus:outline-none focus:ring-0
              disabled:cursor-not-allowed
              ${disabled ? 'text-gray-500' : 'text-gray-900'}
            `}
          />

          {/* Validation icon on right side if user typed something */}
          {showValidation && (
            <div className="px-3 flex items-center">
              {isValid ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
