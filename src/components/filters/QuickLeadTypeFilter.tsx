import React, { useState } from 'react';
import { BadgeCheck, Mail, Link } from "lucide-react";

const leadTypes = [
  { 
    id: "all", 
    label: "All Leads", 
    icon: BadgeCheck,
    description: "See every opportunity",
    activeColor: '#64748b',
    iconColor: '#64748b'
  },
  { 
    id: "contacts", 
    label: "Contact Emails", 
    icon: Mail,
    description: "Direct contact information",
    activeColor: '#00B0FF',
    iconColor: '#00B0FF'
  },
  { 
    id: "events", 
    label: "Event Emails", 
    icon: Mail,
    description: "Event organizer contacts",
    activeColor: '#72cf08',
    iconColor: '#72cf08'
  },
  { 
    id: "urls", 
    label: "Event URLs", 
    icon: Link,
    description: "Event landing pages",
    activeColor: '#72cf08',
    iconColor: '#72cf08'
  }
];

interface QuickLeadTypeFilterProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export default function QuickLeadTypeFilter({ selectedType, onTypeChange }: QuickLeadTypeFilterProps) {
  return (
    <div className="bg-gray-200/70 rounded-xl p-3 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]">
      <div className="grid grid-cols-4 gap-2">
        {leadTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onTypeChange(type.id)}
            className={`group relative px-3 py-2.5 rounded-lg transition-all duration-300
              border bg-white text-left
              ${selectedType === type.id 
                ? 'shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1),0_2px_8px_-2px_rgba(0,0,0,0.05)]' 
                : 'border-gray-200 hover:shadow-sm hover:-translate-y-[1px]'}`}
            style={{
              ...(selectedType === type.id && {
                border: `1px solid ${type.activeColor}`
              })
            }}
          >
            <div className="relative">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center">
                  <type.icon 
                    style={{
                      color: type.iconColor,
                      opacity: selectedType === type.id ? 1 : 0.75
                    }}
                    className={`h-4 w-4 transition-all duration-200 mr-2
                      ${selectedType !== type.id && 'group-hover:opacity-90'}`}
                  />
                  <span 
                    style={{
                      color: selectedType === type.id 
                        ? type.activeColor
                        : '#374151',
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