import React, { useState } from 'react';
import { Briefcase, Check } from 'lucide-react';

export const roles = [
  { id: 'keynote', label: 'Keynote Speaker' },
  { id: 'coach', label: 'Coach / Consultant' },
  { id: 'facilitator', label: 'Facilitator' },
  { id: 'trainer', label: 'Trainer' },
  { id: 'other', label: 'Other' },
];

interface RoleSelectorProps {
  selectedRoles: string[];
  onChange: (value: string) => void;
  error?: string;
}

export default function RoleSelector({ selectedRoles, onChange, error }: RoleSelectorProps) {
  const [otherValue, setOtherValue] = useState('');

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 block">
        Service(s) I Provide
        <span className="ml-2 text-sm font-normal text-gray-500">
          (Select all that apply)
        </span>
      </label>
      <p className="text-sm text-gray-500 mb-3">
        We'll use this to tailor your outreach messages.
      </p>
      <div className="mt-2 grid grid-cols-2 gap-3">
        {roles.map((role) => (
          <label
            key={role.id}
            className={`
              relative flex items-center justify-between px-4 py-3 border rounded-lg cursor-pointer
              focus:outline-none transition-colors
              ${
                selectedRoles.includes(role.id)
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                value={role.id}
                checked={selectedRoles.includes(role.id)}
                onChange={(e) => onChange(e.target.value)}
                className="sr-only"
              />
              <Briefcase
                className={`w-4 h-4 mr-2 ${
                  selectedRoles.includes(role.id)
                    ? 'text-blue-500'
                    : 'text-gray-400'
                }`}
              />
              <span className="text-sm font-medium">{role.label}</span>
            </div>
            {selectedRoles.includes(role.id) && (
              <Check className="w-4 h-4 text-blue-500" />
            )}
          </label>
        ))}
      </div>
      {selectedRoles.includes('other') && (
        <div className="mt-3">
          <input
            type="text"
            value={otherValue}
            onChange={(e) => setOtherValue(e.target.value)}
            placeholder="Please specify other service"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}