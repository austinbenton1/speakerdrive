import React, { useEffect, useState } from 'react';
import type { UserProfile } from '../../types/users';
import UserFilters from './UserFilters';
import UserTable from './UserTable';
import AddUserButton from './AddUserButton';
import { useUserActions } from '../../hooks/useUserActions';

interface UserManagementContentProps {
  users: UserProfile[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  refreshUsers: () => void;
}

export default function UserManagementContent({
  users,
  searchTerm,
  onSearchChange,
  refreshUsers,
}: UserManagementContentProps) {
  const { handleAddUser, handleBanUser, handleUnbanUser } = useUserActions();

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.display_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-4">
      <div className="mb-6 flex items-center justify-between">
        <UserFilters
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onAddUser={handleAddUser}
        />
        <AddUserButton onClick={handleAddUser} />
      </div>

      <UserTable
        users={filteredUsers}
        onBan={async (userId) => {
          await handleBanUser(userId);
          await refreshUsers();
        }}
        onUnban={async (userId) => {
          await handleUnbanUser(userId);
          await refreshUsers();
        }}
      />
    </div>
  );
}