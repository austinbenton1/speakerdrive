import React from 'react';
import { Mail, Link as LinkIcon, Lock, X } from 'lucide-react';
import FilterSection from './FilterSection';

interface UnlockTypeFilterProps {
  selectedTypes: string[];
  onTypeSelect: (type: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed?: boolean;
}

export default function UnlockTypeFilter({
  selectedTypes = [],
  onTypeSelect,
  isOpen,
  onToggle,
  isCollapsed = false
}: UnlockTypeFilterProps) {
  // Add debug log for props
  console.log('[UnlockTypeFilter] Props:', {
    selectedTypes,
    isOpen,
    isCollapsed
  });

  const unlockTypes = [
    {
      id: 'Unlock Contact Email',
      label: 'Contact Emails',
      icon: Mail,
      color: 'blue'
    },
    { 
      id: 'Unlock Event Email', 
      label: 'Event Emails',
      icon: Mail,
      color: 'emerald'
    },
    { 
      id: 'Unlock Event URL', 
      label: 'Event URLs',
      icon: LinkIcon,
      color: 'emerald'
    }
  ];

  // Helper function to check if a type is selected
  const isTypeSelected = (typeId: string): boolean => {
    return selectedTypes.includes(typeId);
  };

  // Handle type selection
  const handleTypeSelect = (typeId: string) => {
    onTypeSelect(typeId);
  };

  if (isCollapsed) {
    return (
      <div className="space-y-2">
        {unlockTypes.map((type) => {
          const isSelected = isTypeSelected(type.id);
          const isContactEmail = type.id === 'Unlock Contact Email';
          const Icon = type.icon;
          
          return (
            <button
              key={type.id}
              onClick={() => handleTypeSelect(type.id)}
              className={`
                w-8 h-8 flex items-center justify-center rounded-lg
                transition-all duration-200 border
                ${isSelected
                  ? isContactEmail
                    ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }
              `}
              title={type.label}
            >
              <Icon className={`w-4 h-4 ${
                isSelected 
                  ? isContactEmail
                    ? 'text-blue-600'
                    : 'text-emerald-600'
                  : 'text-gray-400'
              }`} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <FilterSection
      title="Unlock Type"
      icon={Lock}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-2">
        {unlockTypes.map((type) => {
          const isSelected = isTypeSelected(type.id);
          const isContactEmail = type.id === 'Unlock Contact Email';
          const Icon = type.icon;

          return (
            <div
              key={type.id}
              onClick={() => handleTypeSelect(type.id)}
              className={`
                group flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md
                transition-all duration-200 cursor-pointer border
                ${isSelected
                  ? isContactEmail
                    ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${
                  isSelected
                    ? isContactEmail
                      ? 'text-blue-600'
                      : 'text-emerald-600'
                    : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                <span>{type.label}</span>
              </div>
              {isSelected && (
                <X
                  className={`w-4 h-4 ${
                    isContactEmail ? 'text-blue-400 hover:text-blue-600' : 'text-emerald-400 hover:text-emerald-600'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTypeSelect(type.id);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </FilterSection>
  );
}