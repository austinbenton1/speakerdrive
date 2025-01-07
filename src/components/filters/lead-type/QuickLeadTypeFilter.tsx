import React from 'react';
import { Unlock } from 'lucide-react';
import { leadTypes, type LeadType } from './leadTypeConfig';

interface QuickLeadTypeFilterProps {
  selectedType: LeadType;
  onTypeChange: (type: LeadType) => void;
}

export default function QuickLeadTypeFilter({ 
  selectedType, 
  onTypeChange 
}: QuickLeadTypeFilterProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Unlock className="w-4 h-4 text-blue-600" />
          <label className="block text-sm font-semibold text-gray-900">
            Unlock Type
          </label>
        </div>
        <a 
          href="https://google.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
        >
          Learn more
        </a>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {leadTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onTypeChange(type.id)}
            className={`
              group relative px-3 py-2.5 rounded-lg transition-all duration-300
              border bg-white text-left overflow-hidden
              ${selectedType === type.id 
                ? 'shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1),0_2px_8px_-2px_rgba(0,0,0,0.05)]' 
                : 'border-gray-200 hover:shadow-sm hover:-translate-y-[1px]'}`}
            style={{
              ...(selectedType === type.id && {
                border: `1px solid ${type.activeColor}`
              })
            }}
          >
            {/* Colored side border */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-1 transition-opacity duration-300"
              style={{ 
                background: type.activeColor,
                opacity: selectedType === type.id ? 1 : 0
              }} 
            />

            <div className="relative">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center">
                  <type.icon 
                    style={{
                      color: type.iconColor,
                      opacity: selectedType === type.id ? 1 : 0.75
                    }}
                    className={`h-4 w-4 transition-all duration-200 mr-2
                      ${!selectedType === type.id && 'group-hover:opacity-90'}`}
                  />
                  <span 
                    style={{
                      color: selectedType === type.id ? type.activeColor : '#374151',
                    }}
                    className="text-sm font-medium transition-colors duration-200"
                  >
                    {type.label}
                  </span>
                </div>
              </div>
              <span className={`text-xs block transition-colors duration-200
                ${selectedType === type.id ? 'text-gray-600' : 'text-gray-500'}`}>
                {type.description}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}