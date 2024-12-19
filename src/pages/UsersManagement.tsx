import React, { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import UserManagementHeader from '../components/users/UserManagementHeader';
import UserManagementContent from '../components/users/UserManagementContent';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

export default function UsersManagement() {
  const { users, loading, error, refreshUsers } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'Admin' | 'Client'>('all');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorAlert message={error} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <UserManagementHeader />
      <UserManagementContent
        users={users}
        searchTerm={searchTerm}
        selectedRole={selectedRole}
        onSearchChange={setSearchTerm}
        onRoleChange={setSelectedRole}
        refreshUsers={refreshUsers}
      />
    </div>
  );
}