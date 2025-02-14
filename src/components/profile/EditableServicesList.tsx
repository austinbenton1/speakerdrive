import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { services } from '../../utils/constants';
import ServiceSelector from '../onboarding/ServiceSelector';

interface EditableServicesListProps {
  selectedService: string;
  onSave: (service: string) => Promise<void>;
  disabled?: boolean;
}

export default function EditableServicesList({
  selectedService,
  onSave,
  disabled = false
}: EditableServicesListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedService, setEditedService] = useState(selectedService);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (editedService === selectedService) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editedService);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save service:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <ServiceSelector
          selectedService={editedService}
          onChange={setEditedService}
          disabled={isSaving}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setIsEditing(false)}
            disabled={isSaving}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ServicesList
        selectedService={selectedService}
        disabled={true}
      />
      {!disabled && (
        <button
          onClick={() => setIsEditing(true)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Edit Service
        </button>
      )}
    </div>
  );
}