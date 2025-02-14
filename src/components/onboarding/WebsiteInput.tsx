import React, { useState } from 'react';
import { AlertCircle, Check, Globe } from 'lucide-react';
import { isValidUrl } from '../../utils/validation';

interface WebsiteInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** New Prop: 'website', 'bureau', 'company', 'other' **/
  profile_url_type: 'website' | 'bureau' | 'company' | 'other';
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
  const [noWebsite, setNoWebsite] = useState(false);

  // Conditionally show helper text based on profile_url_type
  const helperTextMap: Record<WebsiteInputProps['profile_url_type'], string> = {
    website: 'Your personal brand website',
    bureau: 'Your speaker bureau profile URL',
    company: 'Your company/organization page',
    other: 'Your professional profile URL',
  };

  // Remove http:// or https:// and www. from display value
  const displayValue = value.replace(/^https?:\/\/(www\.)?/, '');

  // Add https://www. when saving if not present
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    let newValue = e.target.value;
    // Remove any existing protocol and www
    newValue = newValue.replace(/^https?:\/\/(www\.)?/, '');
    // Add https://www. if value is not empty
    if (newValue) {
      newValue = `https://www.${newValue}`;
    }
    onChange({
      ...e,
      target: {
        ...e.target,
        value: newValue,
      },
    });
  };

  const handleNoWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoWebsite(e.target.checked);
    if (e.target.checked) {
      // Clear website value when checkbox is checked
      onChange({
        ...e,
        target: {
          ...e.target,
          value: '',
        },
      });
    }
  };

  const isValid = value ? isValidUrl(value) : false;
  const showValidation = value.length > 0;

  return (
    <div>
      <div className="flex items-center gap-4 mb-2">
        <label className="text-[15px] font-medium text-gray-900">
          Website
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group">
          <input
            type="checkbox"
            checked={noWebsite}
            onChange={handleNoWebsiteChange}
            disabled={disabled}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 group-hover:border-gray-400 transition-colors"
          />
          <span>I don't have one</span>
        </label>
      </div>

      <div className="space-y-2">
        {/* Input Field */}
        <div
          className={`
            relative transition-all duration-200
            ${noWebsite ? 'opacity-40 pointer-events-none' : ''}
          `}
        >
          <div
            className={`
              flex items-center w-full rounded-lg border shadow-sm transition-all duration-200 bg-white overflow-hidden
              ${
                disabled
                  ? 'bg-gray-50/75 border-gray-200'
                  : isValid
                  ? 'border-emerald-300'
                  : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            {/* Prefix Container */}
            <div className="flex items-center h-10 bg-gray-50 border-r border-gray-200">
              <span
                className={`
                  text-sm font-medium px-3
                  ${disabled ? 'text-gray-400' : 'text-gray-500'}
                `}
              >
                https://www.
              </span>
            </div>

            {/* Actual Input */}
            <input
              type="text"
              value={displayValue}
              onChange={handleChange}
              disabled={disabled || noWebsite}
              placeholder="example.com"
              className={`
                flex-1 w-full h-10 pl-2 pr-3
                text-sm bg-transparent
                placeholder:text-gray-400
                focus:outline-none focus:ring-0
                disabled:cursor-not-allowed
                ${disabled || noWebsite ? 'text-gray-500' : 'text-gray-900'}
              `}
            />

            {/* Validation Icon */}
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

        {/* Helper Text (depends on profile_url_type) */}
        <p className="text-[13px] text-gray-500 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" />
          {helperTextMap[profile_url_type]}
        </p>
      </div>

      {error && !noWebsite && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}
