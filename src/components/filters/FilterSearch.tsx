import React from 'react';
import { Search } from 'lucide-react';

interface FilterSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
}

export default function FilterSearch({ value, onChange, placeholder, label }: FilterSearchProps) {
  return (
    <div>
      {label && (
        <label className="block text-[14px] font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="eg Leadership Summit"
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-[14px] placeholder:text-[14px] focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500/40"
        />
      </div>
    </div>
  );
}