import React from 'react';
import { Globe2, Flag } from 'lucide-react';

interface LocationToggleProps {
  isUSAOnly: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}

export default function LocationToggle({ isUSAOnly, onChange, className = '' }: LocationToggleProps) {
  return (
    <button
      onClick={() => onChange(!isUSAOnly)}
      className={`
        inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
        transition-all duration-150 shadow-sm
        hover:shadow hover:scale-[1.02] active:scale-[0.98]
        ${isUSAOnly
          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
        }
        ${className}
      `}
    >
      {isUSAOnly ? (
        <>
          <Flag size={14} />
          <span>Showing USA</span>
        </>
      ) : (
        <>
          <Globe2 size={14} />
          <span>Showing Worldwide</span>
        </>
      )}
    </button>
  );
}