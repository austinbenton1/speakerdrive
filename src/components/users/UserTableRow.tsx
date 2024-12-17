import React from 'react';
import { User, PencilLine, Trash2 } from 'lucide-react';
import type { UserProfile } from '../../types/users';
import { formatDisplayName } from '../../utils/formatters';

interface UserTableRowProps {
  user: UserProfile;
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
}

export default function UserTableRow({ user, onEdit, onDelete }: UserTableRowProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={formatDisplayName(user)}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {formatDisplayName(user)}
            </div>
            <div className="text-sm text-gray-500">
              {user.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.user_type === 'Admin' 
            ? 'bg-purple-100 text-purple-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {user.user_type}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(user.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button 
            onClick={() => onEdit(user.id)}
            className="p-1 text-blue-600 hover:text-blue-900"
          >
            <PencilLine className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(user.id)}
            className="p-1 text-red-600 hover:text-red-900"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}