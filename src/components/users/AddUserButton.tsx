import React from 'react';
import { Plus } from 'lucide-react';

interface AddUserButtonProps {
  onClick: () => void;
}

export default function AddUserButton({ onClick }: AddUserButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
    >
      <Plus className="w-4 h-4 mr-2" />
      Add User
    </button>
  );
}