import React from 'react';
import { Mail, Link as LinkIcon, Lock, X } from 'lucide-react';
import FilterSection from './FilterSection';

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

  return (
    isCollapsed ? (
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
        )})}
      </div>
    ) : (
    <FilterSection
      title="Unlock Type"
      icon={Lock}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-2 relative">
        {unlockTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => {
              if (selectedTypes.includes(type.id)) {
                onTypeSelect(undefined);
              } else {
                onTypeSelect(type.id);
              }
            }}
            className={`group
              relative w-full flex items-center justify-between px-3 py-2.5 rounded-lg
              transition-colors duration-200 border
              ${selectedTypes.includes(type.id)
                ? type.id === 'Unlock Contact Email'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : type.id === 'Unlock Contact Email'
                  ? 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <type.icon className={`w-4 h-4 ${
                selectedTypes.includes(type.id) 
                  ? type.id === 'Unlock Contact Email'
                    ? 'text-blue-600'
                    : 'text-emerald-600'
                  : type.id === 'Unlock Contact Email'
                    ? 'text-blue-400'
                    : 'text-emerald-400'
              }`} />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{type.label}</span>
              </div>
            </div>
            {selectedTypes.includes(type.id) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTypeSelect(undefined);
                }}
                className={`
                  p-1.5 rounded-md opacity-70 hover:opacity-100 cursor-pointer
                  transition-all duration-200 hover:bg-white/50
                  ${
                  type.id === 'Unlock Contact Email'
                    ? 'text-blue-600 hover:text-blue-700'
                    : 'text-emerald-600 hover:text-emerald-700'
                  }
                `}
                aria-label={`Remove ${type.label} filter`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </button>
        ))}
      </div>
    </FilterSection>
    )
  );
}