import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface LeadTypeButtonProps {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  activeColor: string;
  iconColor: string;
  unlockValue: string | null;
  isSelected: boolean;
  onClick: () => void;
}

export default function LeadTypeButton({
  id,
  label,
  description,
  icon: Icon,
  activeColor,
  iconColor,
  unlockValue,
  isSelected,
  onClick
}: LeadTypeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`group relative px-3 py-2.5 rounded-lg transition-all duration-300
        border bg-white text-left overflow-hidden
        ${isSelected 
          ? 'shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1),0_2px_8px_-2px_rgba(0,0,0,0.05)]' 
          : 'border-gray-200 hover:shadow-sm hover:-translate-y-[1px]'}`}
      style={{
        ...(isSelected && {
          border: `1px solid ${activeColor}`
        })
      }}
    >
      {/* Colored side border */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 transition-opacity duration-300"
        style={{ 
          background: activeColor,
          opacity: isSelected ? 1 : 0
        }} 
      />

      <div className="relative">
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center">
            <Icon 
              style={{
                color: iconColor,
                opacity: isSelected ? 1 : 0.75
              }}
              className={`h-4 w-4 transition-all duration-200 mr-2
                ${!isSelected && 'group-hover:opacity-90'}`}
            />
            <span 
              style={{
                color: isSelected ? activeColor : '#374151',
              }}
              className="text-sm font-medium transition-colors duration-200"
            >
              {label}
            </span>
          </div>
        </div>
        <span className={`text-xs block transition-colors duration-200
          ${isSelected ? 'text-gray-600' : 'text-gray-500'}`}>
          {description}
        </span>
      </div>
    </button>
  );
}