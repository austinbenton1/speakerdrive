import React from 'react';
import { KeyRound, ExternalLink, Key } from 'lucide-react';
import type { QuickInfoItem } from '../../../types/leads';
import { SidebarSection } from './SidebarSection';

interface AllUnlocksSectionProps {
  items: QuickInfoItem[];
}

export function AllUnlocksSection({ items }: AllUnlocksSectionProps) {
  return (
    <SidebarSection 
      title="All Unlocks For This Event"
      icon={KeyRound}
    >
      <div className="space-y-4">
        {items
          .filter(item => item.show)
          .map((item, index) => (
            <div key={index} className="flex items-start">
              <div className="flex-shrink-0">
                <Key className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-3 flex-grow">
                <button
                  onClick={item.onClick}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5"
                >
                  <span className="text-left">{item.value.replace('View More - ', '')}</span>
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                </button>
              </div>
            </div>
          ))}
      </div>
    </SidebarSection>
  );
}