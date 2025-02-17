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
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 25;

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.display_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  return (
    <div className="p-4">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div className="order-2 sm:order-1">
          <UserFilters
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
          />
        </div>
        <div className="order-1 sm:order-2">
          <AddUserButton onClick={handleAddUser} />
        </div>
      </div>

      <UserTable
        users={paginatedUsers}
        totalUsers={filteredUsers.length}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
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