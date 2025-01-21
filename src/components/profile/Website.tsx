import React from 'react';
import { Globe, AlertCircle, Check } from 'lucide-react';
import { isValidUrl } from '../../utils/validation';

interface WebsiteProps {
  value: string;
  onChange: (value: string) => void;
  isEditing?: boolean;
  disabled?: boolean;
}

export default function Website({
  value,
  onChange,
  isEditing = false,
  disabled = false
}: WebsiteProps) {
  // Remove http:// or https:// from display value
  const displayValue = value.replace(/^https?:\/\//, '');
  
  // Add https:// when saving if not present
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    let newValue = e.target.value;
    // Remove any existing protocol
    newValue = newValue.replace(/^https?:\/\//, '');
    // Add https:// if value is not empty
    if (newValue) {
      newValue = `https://${newValue}`;
    }
    onChange(newValue);
  };

  const isValid = value ? isValidUrl(value) : false;
  const showValidation = value.length > 0;

  return (
    <div>
      <label className="block text-[15px] font-medium text-gray-900 mb-2">
        Website
      </label>
      <div className="relative">
        {!isEditing ? (
        <div 
          className={`
            relative p-3 border rounded-lg
            ${disabled 
              ? 'bg-gray-50 cursor-not-allowed' 
              : 'bg-white hover:border-gray-400 cursor-text'
            }
          `}
        >
          {value ? (
            <a 
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              {value.replace(/^https?:\/\//, '')}
            </a>
          ) : (
            <span className="text-gray-500">No website set</span>
          )}
        </div>
        ) : (
        <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Globe className={`w-5 h-5 ${disabled ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
        <div className="absolute inset-y-0 left-11 flex items-center pointer-events-none">
          <span className={`
            text-[15px] px-1.5 rounded flex items-center h-[26px] mt-[1px]
            ${disabled 
              ? 'text-gray-400 bg-gray-50' 
              : 'text-gray-500 bg-gray-50/75'
            }
          `}>
            https://
          </span>
          <div className={`
            w-px h-[26px] mt-[1px]
            ${disabled ? 'bg-gray-200' : 'bg-gray-300'}
          `} />
        </div>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder="www.example.com"
          className={`
            block w-full pl-[116px] pr-10 py-2 
            border rounded-lg bg-white text-[15px]
            ${disabled ? 'bg-gray-50/75 text-gray-500 border-gray-200' : 
              isValid ? 'border-emerald-300 focus:ring-emerald-500/10 focus:border-emerald-500' :
              'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500/10 focus:ring-2'
            }
            placeholder:text-gray-400
            focus:outline-none focus:ring-opacity-20
            disabled:cursor-not-allowed
          `}
        />
        {showValidation && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            {isValid ? (
              <Check className="h-5 w-5 text-emerald-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        )}
      </div>
        )}
      </div>
      <p className="mt-1 text-[13px] text-gray-500">
        Your personal brand website or LinkedIN profile
      </p>
    </div>
  );
}
