import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { services } from '../../utils/constants';
import ServiceSelector from '../onboarding/ServiceSelector';

interface EditableServicesListProps {
  selectedServices: string[];
  onSave: (services: string[]) => Promise<void>;
  onCancel: () => void;
}

export default function EditableServicesList({
  selectedServices,
  onSave,
  onCancel
}: EditableServicesListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempServices, setTempServices] = useState(selectedServices);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();

  const handleSave = async () => {
    if (tempServices.length === 0) {
      setError('Please select at least one service');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(tempServices);
      setIsEditing(false);
      setError(undefined);
    } catch (error) {
      setError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempServices(selectedServices);
    setError(undefined);
    onCancel();
  };

  if (!isEditing) {
    return (
      <div
        onClick={() => setIsEditing(true)}
        className="group cursor-pointer"
      >
        <div className="space-y-2">
          {selectedServices.length === 0 ? (
            <p className="text-sm text-gray-500">Click to add services</p>
          ) : (
            services.map((service) => {
              if (!selectedServices.includes(service.id)) return null;
              return (
                <div
                  key={service.id}
                  className="flex items-center text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-md"
                >
                  <Check className="w-4 h-4 text-blue-500 mr-2" />
                  <span>{service.label}</span>
                </div>
              );
            })
          )}
        </div>
        <span className="hidden group-hover:inline-block text-xs text-gray-400 mt-2">
          Click to edit
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ServiceSelector
        selectedServices={tempServices}
        onChange={(serviceId) => {
          const newServices = tempServices.includes(serviceId)
            ? tempServices.filter(id => id !== serviceId)
            : [...tempServices, serviceId];
          setTempServices(newServices);
          setError(undefined);
        }}
        error={error}
      />

      <div className="flex items-center space-x-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-1.5" />
              Save
            </>
          )}
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <X className="w-4 h-4 mr-1.5" />
          Cancel
        </button>
      </div>
    </div>
  );
}