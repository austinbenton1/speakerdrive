import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  label: string;
  type?: 'text' | 'email' | 'textarea';
  disabled?: boolean;
  validate?: (value: string) => string | undefined;
}

export default function EditableField({
  value,
  onChange,
  onSave,
  onCancel,
  label,
  type = 'text',
  disabled = false,
  validate
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [error, setError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setTempValue(value);
    setError(undefined);
  };

  const handleSave = async () => {
    if (validate) {
      const error = validate(tempValue);
      if (error) {
        setError(error);
        return;
      }
    }

    setIsSaving(true);
    try {
      onChange(tempValue);
      await onSave();
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
    setTempValue(value);
    setError(undefined);
    onCancel();
  };

  if (!isEditing) {
    return (
      <div className="group relative">
        <div
          onClick={handleEdit}
          className={`
            p-2 rounded-md border border-transparent
            ${!disabled && 'group-hover:border-gray-200 group-hover:bg-gray-50 cursor-pointer'}
          `}
        >
          <p className="text-sm text-gray-900">{value || 'Click to edit'}</p>
        </div>
        {!disabled && (
          <span className="absolute inset-y-0 right-2 hidden group-hover:flex items-center text-xs text-gray-400">
            Click to edit
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="max-w-md">
        <input
          type={type}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm text-sm
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-300' : 'border-gray-300'}
          `}
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

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