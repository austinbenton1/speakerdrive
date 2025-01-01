import React from 'react';
import { parseValueProfile } from '../../../utils/valueProfileParser';

interface ValueProfileContentProps {
  valueProfile: string | undefined;
}

export function ValueProfileContent({ valueProfile }: ValueProfileContentProps) {
  const items = parseValueProfile(valueProfile);

  if (!valueProfile) {
    return <p className="text-[15px] text-gray-600">No opportunity profile available</p>;
  }

  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div key={index} className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">
            {item.title}
          </h3>
          <p className="text-[15px] text-gray-600 leading-relaxed whitespace-pre-line">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}