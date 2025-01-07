import React, { KeyboardEvent } from 'react';
import { Search } from 'lucide-react';

interface FilterSearchProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
}

export default function FilterSearch({ 
  value, 
  onChange, 
  onKeyDown,
  placeholder = "Search...", 
  label,
  helperText
}: FilterSearchProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 
          peer-focus:text-gray-600 transition-colors" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="peer w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm 
            placeholder:text-gray-400 
            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 focus:bg-white
            hover:border-gray-300 transition-all
            shadow-sm"
        />
      </div>
      {helperText && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}