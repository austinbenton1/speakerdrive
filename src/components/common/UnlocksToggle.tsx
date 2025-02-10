import React from 'react';
import { EyeOff, Eye } from 'lucide-react';

interface UnlocksToggleProps {
  isShown: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}

export default function UnlocksToggle({ isShown, onChange, className = '' }: UnlocksToggleProps) {
  return (
    <button
      onClick={() => onChange(!isShown)}
      className={`
        inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
        transition-all duration-150 shadow-sm
        hover:shadow hover:scale-[1.02] active:scale-[0.98]
        ${isShown
          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
        }
        ${className}
      `}
    >
      {isShown ? (
        <>
          <Eye size={14} />
          <span>Unlocks Shown</span>
        </>
      ) : (
        <>
          <EyeOff size={14} />
          <span>Unlocks Hidden</span>
        </>
      )}
    </button>
  );
}
