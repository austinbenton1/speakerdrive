import React from 'react';

interface OutlinedToggleProps {
  checked: boolean;
  onChange: () => void;
  leftLabel?: string;
  rightLabel?: string;
  disabled?: boolean;
}

export default function OutlinedToggle({
  checked,
  onChange,
  leftLabel = 'Unique',
  rightLabel = 'All',
  disabled = false
}: OutlinedToggleProps) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`
        relative w-[160px] h-9 rounded-lg border-2 transition-all duration-200
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:border-gray-300'
        }
        ${checked 
          ? 'border-blue-200 bg-white' 
          : 'border-gray-200 bg-white'
        }
      `}
    >
      {/* Labels Container */}
      <div className="absolute inset-0 flex">
        {/* Left Label (Unique) */}
        <div className={`flex-1 flex items-center justify-center transition-colors duration-200
          ${!checked ? 'text-gray-900' : 'text-gray-400'}`}>
          <span className="text-xs font-medium">{leftLabel}</span>
        </div>
        
        {/* Right Label (All) */}
        <div className={`flex-1 flex items-center justify-center transition-colors duration-200
          ${checked ? 'text-gray-900' : 'text-gray-400'}`}>
          <span className="text-xs font-medium">{rightLabel}</span>
        </div>
      </div>

      {/* Active Indicator */}
      <div
        className={`
          absolute top-[2px] bottom-[2px] w-[72px]
          rounded-md transition-all duration-300 ease-out
          bg-gradient-to-br from-blue-500 to-blue-600
          shadow-[0_2px_8px_-2px_rgba(59,130,246,0.3)]
          ${checked 
            ? 'translate-x-[82px]' 
            : 'translate-x-[2px]'
          }
        `}
      >
        {/* Active Label (for better contrast) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-white">
            {checked ? rightLabel : leftLabel}
          </span>
        </div>
      </div>
    </button>
  );
}