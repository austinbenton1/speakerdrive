import React from 'react';
import { Check } from 'lucide-react';
import { services } from '../../utils/constants';

interface ServicesListProps {
  selectedServices: string[];
}

export default function ServicesList({ selectedServices }: ServicesListProps) {
  if (selectedServices.length === 0) {
    return <p className="text-sm text-gray-500">No services selected</p>;
  }

  return (
    <div className="space-y-2">
      {services.map((service) => {
        const isSelected = selectedServices.includes(service.id);
        if (!isSelected) return null;

        return (
          <div
            key={service.id}
            className="flex items-center text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-md"
          >
            <Check className="w-4 h-4 text-blue-500 mr-2" />
            <span>{service.label}</span>
          </div>
        );
      })}
    </div>
  );
}