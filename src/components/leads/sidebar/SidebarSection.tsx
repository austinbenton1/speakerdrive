import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SidebarSectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export function SidebarSection({ title, icon: Icon, children }: SidebarSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200/75 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="border-b border-gray-200">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-100 via-gray-50 to-white">
          <div className="flex items-center">
            <div className="p-1.5 rounded-md bg-white shadow-sm border border-gray-100">
              <Icon className="w-4 h-4 text-[#00B341]" />
            </div>
            <h3 className="ml-3 text-sm font-semibold text-gray-900">
              {title}
            </h3>
          </div>
        </div>
      </div>
      <div className="px-6 py-5">
        {children}
      </div>
    </div>
  );
}