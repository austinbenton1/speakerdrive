import React from 'react';
import { Mail, Link as LinkIcon, Lock, X, HelpCircle } from 'lucide-react';
import FilterSection from './FilterSection';
import { Tooltip } from '../ui/Tooltip';

interface UnlockTypeFilterProps {
  selectedTypes: string[];
  onTypeSelect: (type: string | undefined) => void;
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed?: boolean;
}

export default function UnlockTypeFilter({
  selectedTypes,
  onTypeSelect,
  isOpen,
  onToggle,
  isCollapsed = false
}: UnlockTypeFilterProps) {
  const unlockTypes = [
    {
      id: 'Unlock Contact Email',
      label: 'Contact Emails',
      icon: Mail
    },
    { 
      id: 'Unlock Event Email', 
      label: 'Event Emails',
      icon: Mail
    },
    { 
      id: 'Unlock Event URL', 
      label: 'Event URLs',
      icon: LinkIcon
    }
  ];

  if (isCollapsed) {
    return (
      <div className="space-y-2">
        {unlockTypes.map((type) => {
          const isSelected = selectedTypes.includes(type.id);
          const isContactEmail = type.id === 'Unlock Contact Email';
          const Icon = type.icon;
          
          return (
            <button
              key={type.id}
              onClick={() => {
                if (isSelected) {
                  onTypeSelect(undefined);
                } else {
                  onTypeSelect(type.id);
                }
              }}
              className={`
                w-8 h-8 flex items-center justify-center rounded-lg
                transition-all duration-200 border
                ${isSelected
                  ? isContactEmail
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : isContactEmail
                    ? 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50'
                }
              `}
              title={type.label}
            >
              <Icon className={`w-4 h-4 ${
                isSelected 
                  ? isContactEmail
                    ? 'text-blue-600'
                    : 'text-emerald-600'
                  : isContactEmail
                    ? 'text-blue-400'
                    : 'text-emerald-400'
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
      <div className="space-y-2 relative">
        {unlockTypes.map((type) => (
          <div
            key={type.id}
            onClick={() => {
              onTypeSelect(selectedTypes.includes(type.id) ? undefined : type.id);
            }}
            className={`
              group flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md
              transition-all duration-200 cursor-pointer
              ${selectedTypes.includes(type.id)
                ? 'bg-white border border-gray-200 text-gray-900'
                : 'text-gray-600 hover:bg-white hover:text-gray-900'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <type.icon className={`w-4 h-4 ${
                selectedTypes.includes(type.id)
                  ? 'text-blue-600'
                  : 'text-gray-400 group-hover:text-gray-600'
              }`} />
              <span>{type.label}</span>
            </div>
            {selectedTypes.includes(type.id) && (
              <X
                className="w-4 h-4 text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onTypeSelect(undefined);
                }}
              />
            )}
          </div>
        ))}
      </div>
    </FilterSection>
  );
}