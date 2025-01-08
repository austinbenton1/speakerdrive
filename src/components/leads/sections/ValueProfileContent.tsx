import React from 'react';
import { Tooltip } from '../../Tooltip';

interface ValueProfileItem {
  title: string;
  description: string;
  highlightedValues?: string[];
  isBusinessPotential?: boolean;
}

function parseValueProfile(valueProfile: string | undefined): ValueProfileItem[] {
  if (!valueProfile) return [];

  const items: ValueProfileItem[] = [];
  const parts = valueProfile.split('\n\n').filter(Boolean);
  
  for (const part of parts) {
    if (!part.trim()) continue;

    // Special handling for fee potential line with estimated range
    if (part.toLowerCase().includes('fee potential') && part.toLowerCase().includes('estimated range:')) {
      const match = part.match(/Fee Potential\s*→\s*Estimated Range:\s*(.*)/i);
      if (match) {
        items.push({
          title: 'Fee Potential → Estimated Range:',
          description: '',
          highlightedValues: [match[1].trim()]
        });
        continue;
      }
    }

    // Special handling for Business Potential section
    if (part.toLowerCase().startsWith('business potential')) {
      const [title, content] = part.split('→').map(s => s.trim());
      if (content) {
        // Split content by periods and filter out empty strings
        const values = content
          .split('.')
          .map(s => s.trim())
          .filter(Boolean);

        // Add the business potential header with tags
        items.push({
          title: title + ' →',
          description: '',
          highlightedValues: values,
          isBusinessPotential: true
        });
        continue;
      }
    }

    // Handle the note about fee potential separately
    if (part.toLowerCase().includes('fee potential is a directional')) {
      items.push({
        title: '',
        description: part.trim()
      });
      continue;
    }

    // Regular content parsing
    if (part.includes('->')) {
      const [title, ...descParts] = part.split('->');
      const description = descParts.join('->').trim();
      items.push({
        title: title.trim(),
        description
      });
    } else {
      items.push({
        title: '',
        description: part.trim()
      });
    }
  }

  return items;
}

export function ValueProfileContent({ valueProfile }: { valueProfile: string | undefined }) {
  const items = parseValueProfile(valueProfile);

  if (!valueProfile) {
    return <p className="text-[15px] text-gray-600">No opportunity profile available</p>;
  }

  return (
    <div className="space-y-6">
      {items.map((item, index) => {
        // Skip empty items
        if (!item.title && !item.description) return null;

        return (
          <div key={index} className="space-y-2">
            {item.title && (
              <div className="flex items-start gap-2 flex-wrap">
                <h3 className="text-sm font-medium text-gray-900 inline-flex items-center gap-2">
                  {item.title}
                  {index === 0 && (
                    <Tooltip content="Fee potential is directional, high level estimate only; actual fees may vary considerably." />
                  )}
                </h3>
                {item.highlightedValues?.map((value, valueIndex) => (
                  <span 
                    key={valueIndex}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    {value}
                  </span>
                ))}
              </div>
            )}
            {item.description && (
              <p className={`text-[15px] leading-relaxed whitespace-pre-wrap ${
                item.isBusinessPotential ? 'text-gray-600 font-normal' : 'text-gray-600'
              }`}>
                {item.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}