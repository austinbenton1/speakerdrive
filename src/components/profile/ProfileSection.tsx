import React from 'react';

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
  isEditing?: boolean;
}

export default function ProfileSection({ title, children, isEditing }: ProfileSectionProps) {
  return (
    <div className={`space-y-3 ${!isEditing ? 'opacity-90' : ''}`}>
      <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      {children}
    </div>
  );
}