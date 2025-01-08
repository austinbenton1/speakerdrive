import React from 'react';
import { Building, HelpCircle } from 'lucide-react';
import type { QuickInfoItem } from '../../../types/leads';
import { SidebarSection } from './SidebarSection';

interface OrganizationSectionProps {
  items: QuickInfoItem[];
}

export function OrganizationSection({ items }: OrganizationSectionProps) {
  // Debug tooltips
  console.log('Organization Section Items:', items.map(item => ({
    label: item.label,
    tooltip: item.tooltip
  })));

  return (
    <SidebarSection 
      title="Host Organization"
      icon={Building}
    >
      <div className="space-y-4">
        {items
          .filter(item => item.show)
          .map((item, index) => (
            <div key={index} className="flex items-start">
              <div className="flex-shrink-0">
                <item.icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-3 flex-grow">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  {item.tooltip && (
                    <div className="relative group">
                      <button className="w-4 h-4 text-gray-400">
                        <HelpCircle className="w-4 h-4" />
                      </button>
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                        {item.tooltip}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {item.isLink ? (
                    <button
                      onClick={item.onClick}
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                      {item.value}
                    </button>
                  ) : (
                    <span className="text-sm text-gray-900">{item.value}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </SidebarSection>
  );
}