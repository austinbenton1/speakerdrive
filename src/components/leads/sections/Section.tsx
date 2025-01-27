import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SectionProps {
  icon: LucideIcon;
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Section({ icon: Icon, title, children, className = '' }: SectionProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200/75 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-full ${className}`}>
      <div className="border-b border-gray-200">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-100 via-gray-50 to-white">
          <div className="flex items-center">
            <div className="p-1.5 rounded-md bg-white shadow-sm border border-gray-100">
              <Icon className="w-4 h-4 text-[#0066FF]" />
            </div>
            <h2 className="ml-3 text-sm font-semibold text-gray-900">{title}</h2>
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}