import React from 'react';

interface SearchContainerProps {
  children: React.ReactNode;
}

export default function SearchContainer({ children }: SearchContainerProps) {
  return (
    <div className="relative bg-gradient-to-br from-white to-gray-50/50 rounded-xl shadow-sm border border-gray-200/75 p-4 mb-3 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF]/[0.01] to-[#0066FF]/[0.005]" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}