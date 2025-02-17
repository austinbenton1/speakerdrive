import React from 'react';
import { Search } from 'lucide-react';

interface UserFiltersProps {
  searchTerm: string;
  selectedRole: 'all' | 'Admin' | 'Client';
  onSearchChange: (value: string) => void;
  onRoleChange: (role: 'all' | 'Admin' | 'Client') => void;
}

export default function UserFilters({ 
  searchTerm, 
  selectedRole, 
  onSearchChange, 
  onRoleChange 
}: UserFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:space-x-4 w-full sm:w-auto">
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40"
        />
      </div>
      <select
        value={selectedRole}
        onChange={(e) => onRoleChange(e.target.value as 'all' | 'Admin' | 'Client')}
        className="w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40"
      >
        <option value="all">All Roles</option>
        <option value="Admin">Admin</option>
        <option value="Client">Client</option>
      </select>
    </div>
  );
}