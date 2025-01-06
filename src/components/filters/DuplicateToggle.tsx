import React from 'react';
import { Copy } from 'lucide-react';

interface DuplicateToggleProps {
  enabled: boolean;
  onToggle: () => void;
  originalCount: number;
  uniqueCount: number;
}

export default function DuplicateToggle({ 
  enabled, 
  onToggle,
  originalCount,
  uniqueCount 
}: DuplicateToggleProps) {
  const duplicateCount = originalCount - uniqueCount;
  
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggle}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors
          ${enabled 
            ? 'bg-blue-50 border-blue-200 text-blue-700' 
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }
        `}
      >
        <Copy className="w-4 h-4" />
        <span className="text-sm font-medium">Hide Duplicates</span>
      </button>
      {enabled && duplicateCount > 0 && (
        <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
          {duplicateCount} duplicate{duplicateCount !== 1 ? 's' : ''} hidden
        </span>
      )}
    </div>
  );
}