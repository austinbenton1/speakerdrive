import React from 'react';
import type { UserProfile } from '../../types/users';
import UserFilters from './UserFilters';
import UserTable from './UserTable';
import AddUserButton from './AddUserButton';
import { useUserActions } from '../../hooks/useUserActions';

interface UserManagementContentProps {
  users: UserProfile[];
  searchTerm: string;
  selectedRole: 'all' | 'Admin' | 'Client';
  onSearchChange: (value: string) => void;
  onRoleChange: (role: 'all' | 'Admin' | 'Client') => void;
}

export default function UserManagementContent({
  users,
  searchTerm,
  selectedRole,
  onSearchChange,
  onRoleChange,
}: UserManagementContentProps) {
  const { handleAddUser, handleEditUser, handleDeleteUser } = useUserActions();

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.display_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.user_type === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <UserFilters
          searchTerm={searchTerm}
          selectedRole={selectedRole}
          onSearchChange={onSearchChange}
          onRoleChange={onRoleChange}
        />
        <AddUserButton onClick={handleAddUser} />
      </div>

      <UserTable
        users={filteredUsers}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
    </>
  );
}