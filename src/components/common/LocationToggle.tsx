import React from 'react';
import { Globe, MapPin } from 'lucide-react';

interface LocationToggleProps {
  isUSAOnly: boolean;
  onChange: (isUSAOnly: boolean) => void;
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
          ? 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200'
          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
        }
        ${className}
      `}
      title={isUSAOnly ? 'Click to show worldwide leads' : 'Click to show USA leads only'}
    >
      {isUSAOnly ? (
        <>
          <MapPin className="w-3 h-3 text-slate-700" />
          <span>Showing USA</span>
        </>
      ) : (
        <>
          <Globe className="w-3 h-3 text-gray-500" />
          <span>Showing Worldwide</span>
        </>
      )}
    </button>
  );
}