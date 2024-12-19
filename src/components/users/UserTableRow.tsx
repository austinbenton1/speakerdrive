import React, { useState } from 'react';
import { User, Ban, Unlock } from 'lucide-react';
import type { UserProfile } from '../../types/users';
import { formatDisplayName } from '../../utils/formatters';
import { formatRelativeTime } from '../../utils/dateFormatter';
import ConfirmationModal from '../shared/ConfirmationModal';

interface UserTableRowProps {
  user: UserProfile;
  onBan: (userId: string) => Promise<void>;
  onUnban: (userId: string) => Promise<void>;
}

export default function UserTableRow({ user, onBan, onUnban }: UserTableRowProps) {
  const [showBanModal, setShowBanModal] = useState(false);
  const [showUnbanModal, setShowUnbanModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBanConfirm = async () => {
    try {
      setIsProcessing(true);
      await onBan(user.id);
      setShowBanModal(false);
    } catch (error) {
      console.error('Error banning user:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnbanConfirm = async () => {
    try {
      setIsProcessing(true);
      await onUnban(user.id);
      setShowUnbanModal(false);
    } catch (error) {
      console.error('Error unbanning user:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
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
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            user.user_type === 'Admin' 
              ? 'bg-purple-100 text-purple-800'
              : user.user_type === 'Manager'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {user.user_type}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {formatRelativeTime(user.created_at)}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex flex-col gap-1">
            <div className="flex">
              <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${user.banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {user.banned ? 'Banned' : 'Active'}
              </span>
            </div>
            {user.banned && user.banned_at && (
              <div className="text-xs text-gray-500">
                <div>Banned {formatRelativeTime(user.banned_at)}</div>
                {user.banned_by_display_name && (
                  <div>By: {user.banned_by_display_name}</div>
                )}
              </div>
            )}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          {user.banned ? (
            <button
              onClick={() => setShowUnbanModal(true)}
              className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1"
            >
              <Unlock className="h-4 w-4" />
              Unban
            </button>
          ) : (
            <button
              onClick={() => setShowBanModal(true)}
              className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
            >
              <Ban className="h-4 w-4" />
              Ban
            </button>
          )}
        </td>
      </tr>

      <ConfirmationModal
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        onConfirm={handleBanConfirm}
        title="Ban User"
        message={`Are you sure you want to ban ${formatDisplayName(user)}? They will no longer be able to access the application.`}
        confirmText="Ban User"
        isProcessing={isProcessing}
      />

      <ConfirmationModal
        isOpen={showUnbanModal}
        onClose={() => setShowUnbanModal(false)}
        onConfirm={handleUnbanConfirm}
        title="Unban User"
        message={`Are you sure you want to unban ${formatDisplayName(user)}? They will regain access to the application.`}
        confirmText="Unban"
        isProcessing={isProcessing}
        confirmButtonColor="green"
      />
    </>
  );
}