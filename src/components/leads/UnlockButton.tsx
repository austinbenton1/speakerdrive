import React from 'react';
import { Mail, Link } from 'lucide-react';

interface UnlockButtonProps {
  type: string;
}

export default function UnlockButton({ type }: UnlockButtonProps) {
  const baseButton = `
    inline-flex items-left justify-left px-4 py-1.5 rounded-md w-[160px]
    font-medium transition-all duration-300 relative
    hover:scale-[1.02] hover:-translate-y-0.5
  `;

  const getButtonStyle = () => {
    switch (type) {
      case 'Unlock Event URL':
        return `
          ${baseButton}
          bg-emerald-500 text-white shadow-sm shadow-emerald-500/25
          hover:shadow-emerald-500/40 group
        `;
      case 'Unlock Contact Email':
        return `
          ${baseButton}
          bg-blue-500 text-white shadow-sm shadow-blue-500/25
          hover:shadow-blue-500/40 group
        `;
      case 'Unlock Event Email':
        return `
          ${baseButton}
          bg-emerald-400 text-white shadow-sm shadow-emerald-400/25
          hover:shadow-emerald-400/40 group
        `;
      default:
        return `
          ${baseButton}
          bg-gray-100 text-gray-700 shadow-sm shadow-gray-100/25
          hover:shadow-gray-100/40 group
        `;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'Unlock Event URL':
        return <Link className="h-4 w-4 shrink-0" />;
      case 'Unlock Contact Email':
      case 'Unlock Event Email':
        return <Mail className="h-4 w-4 shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <button
      className={getButtonStyle()}
      onClick={(e) => e.stopPropagation()}
    >
      {getIcon()}
      <span className="ml-1.5 text-sm">{type.replace('Unlock ','')}</span>
      <div className="absolute inset-0 rounded-md bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}