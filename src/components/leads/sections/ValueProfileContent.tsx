import React from 'react';
import { Tooltip } from '../../Tooltip';

interface ValueProfileItem {
  title: string;
  beforeArrow?: string;
  pills: string[];
  description: string[];
}

export function ValueProfileContent({ valueProfile }: { valueProfile: string | undefined }) {
  if (!valueProfile) {
    return <p className="text-[15px] text-gray-600">No opportunity profile available</p>;
  }

  const sections = valueProfile
    .split('\n\n')
    .filter(section => section.trim())
    .map(section => section.replace(/\s*->\s*/g, ' → '));

  const items: ValueProfileItem[] = [];
  let currentItem: ValueProfileItem | null = null;

  sections.forEach(section => {
    if (section.includes('→')) {
      // Start a new item
      if (currentItem) {
        items.push(currentItem);
      }
      const [beforeArrow, afterArrow] = section.split('→').map(s => s.trim());
      const pills = afterArrow
        ? afterArrow
            .split('.')
            .map(s => s.trim())
            .filter(Boolean)
        : [];
      
      currentItem = {
        title: section,
        beforeArrow,
        pills,
        description: []
      };
    } else if (currentItem) {
      // Add to current item's description
      currentItem.description.push(section);
    } else {
      // Standalone description without a title
      currentItem = {
        title: '',
        pills: [],
        description: [section]
      };
    }
  });

  // Don't forget to add the last item
  if (currentItem) {
    items.push(currentItem);
  }

  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div key={index} className="space-y-2">
          {item.beforeArrow && (
            <div className="space-y-2">
              <div className="flex items-start gap-2 flex-wrap">
                <h3 className="text-sm font-medium text-gray-900">
                  {item.beforeArrow} →
                </h3>
                {item.pills.map((pill, pillIndex) => (
                  <span
                    key={pillIndex}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    {pill}
                  </span>
                ))}
                {item.beforeArrow.toLowerCase().includes('fee potential') && (
                  <Tooltip content="Fee potential is directional, high level estimate only; actual fees may vary considerably." />
                )}
              </div>
            </div>
          )}
          {item.description.map((desc, descIndex) => (
            <p key={descIndex} className="text-[15px] text-gray-600 whitespace-pre-wrap leading-relaxed">
              {desc}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}